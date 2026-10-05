const expenseCategories = new Set([
    'Bills',
    'Rent',
    'Utilities',
    'Equipment',
    'Marketing',
    'Salaries',
    'Maintenance',
    'Insurance',
    'Supplies',
    'Other',
]);

const expenseFields = new Set(['name', 'category', 'amount', 'dateOfPayment', 'description']);

export interface ExpenseInput {
    name?: unknown;
    category?: unknown;
    amount?: unknown;
    dateOfPayment?: unknown;
    description?: unknown;
}

export function validateExpenseInput(
    input: ExpenseInput,
    mode: 'create' | 'update',
): string[] {
    const errors: string[] = [];

    for (const key of Object.keys(input)) {
        if (!expenseFields.has(key)) errors.push(`Unknown field: ${key}`);
    }

    if (mode === 'create' || input.name !== undefined) {
        if (typeof input.name !== 'string' || input.name.trim().length === 0) {
            errors.push('name is required');
        }
    }

    if (mode === 'create' || input.category !== undefined) {
        if (typeof input.category !== 'string' || !expenseCategories.has(input.category)) {
            errors.push('category is invalid');
        }
    }

    if (mode === 'create' || input.amount !== undefined) {
        if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount < 0) {
            errors.push('amount must be a non-negative finite number');
        }
    }

    if (mode === 'create' || input.dateOfPayment !== undefined) {
        const date = new Date(String(input.dateOfPayment));
        if (!input.dateOfPayment || Number.isNaN(date.getTime())) {
            errors.push('dateOfPayment must be a valid date');
        }
    }

    if (input.description !== undefined && typeof input.description !== 'string') {
        errors.push('description must be a string');
    }

    return errors;
}
