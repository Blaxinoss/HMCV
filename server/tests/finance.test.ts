import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLedgerSummary } from '../src/utils/finance.js';
import PaymentTransaction from '../src/models/PaymentTransaction.js';
import { validateExpenseInput } from '../src/utils/validation.js';
import { calculateCouponDiscount } from '../src/services/couponService.js';
import { DiscountType } from '../src/models/Coupons.js';

test('ledger calculates net paid and outstanding balance from posted transactions', () => {
    const summary = calculateLedgerSummary(10_000, [
        { type: 'payment', amountMinor: 6_000 },
        { type: 'payment', amountMinor: 2_000 },
        { type: 'refund', amountMinor: 1_000 },
        { type: 'adjustment', amountMinor: 500 },
    ]);

    assert.deepEqual(summary, {
        grossPaidMinor: 8_000,
        refundedMinor: 1_000,
        adjustmentsMinor: 500,
        netPaidMinor: 7_500,
        outstandingMinor: 2_500,
    });
});

test('voided transactions do not affect the financial summary', () => {
    const summary = calculateLedgerSummary(1_000, [
        { type: 'payment', amountMinor: 1_000 },
        { type: 'refund', amountMinor: 1_000, status: 'voided' },
    ]);

    assert.equal(summary.netPaidMinor, 1_000);
    assert.equal(summary.outstandingMinor, 0);
});

test('ledger rejects fractional and negative money values', () => {
    assert.throws(
        () => calculateLedgerSummary(1_000, [{ type: 'payment', amountMinor: 10.5 }]),
        /integer/,
    );
    assert.throws(
        () => calculateLedgerSummary(1_000, [{ type: 'refund', amountMinor: -1 }]),
        /non-negative/,
    );
});

test('ledger never reports negative outstanding balance after overpayment', () => {
    const summary = calculateLedgerSummary(1_000, [
        { type: 'payment', amountMinor: 1_500 },
    ]);

    assert.equal(summary.netPaidMinor, 1_500);
    assert.equal(summary.outstandingMinor, 0);
});

test('payment transaction schema requires a billing cycle and integer amount', () => {
    const transaction = new PaymentTransaction({
        traineeId: '507f1f77bcf86cd799439011',
        type: 'payment',
        amountMinor: 10.5,
    });

    const validationError = transaction.validateSync();

    assert.ok(validationError);
    assert.match(validationError.errors.billingCycleId.message, /required/);
    assert.match(validationError.errors.amountMinor.message, /integer/);
});

test('expense validation distinguishes zero from missing and rejects invalid values', () => {
    assert.deepEqual(validateExpenseInput({
        name: 'Free promotional expense',
        category: 'Marketing',
        amount: 0,
        dateOfPayment: '2026-09-09',
    }, 'create'), []);

    assert.deepEqual(validateExpenseInput({
        name: 'Broken expense',
        category: 'Marketing',
        amount: -1,
        dateOfPayment: 'not-a-date',
    }, 'create'), [
        'amount must be a non-negative finite number',
        'dateOfPayment must be a valid date',
    ]);

    assert.deepEqual(validateExpenseInput({ amount: 0 }, 'update'), []);
    assert.deepEqual(validateExpenseInput({ amount: 10, hacked: true } as Record<string, unknown>, 'update'), [
        'Unknown field: hacked',
    ]);
});

test('coupon discount calculation caps discounts at the purchase total', () => {
    assert.equal(calculateCouponDiscount(DiscountType.PERCENTAGE, 25, 1_000), 250);
    assert.equal(calculateCouponDiscount(DiscountType.FIXED, 1_500, 1_000), 1_000);
    assert.throws(
        () => calculateCouponDiscount(DiscountType.FIXED, -1, 1_000),
        /non-negative/,
    );
});
