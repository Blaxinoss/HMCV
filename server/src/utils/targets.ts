
import axios from 'axios';
import type { Model } from 'mongoose';
import type { ITrainee } from '../models/Trainees.js';
import type { IPaymentTransaction } from '../models/PaymentTransaction.js';
import { getLedgerSummaryMap } from '../services/financeService.js';
import { endOfGymDay, startOfGymDay, toGymDateTime, utcNow, utcNowIso } from './dateTime.js';

export const getTargets = async (
    type: string,
    Trainees: Model<ITrainee>,
    PaymentTransaction: Model<IPaymentTransaction>,
) => {


    let query = {}
    const now = utcNow();
    const todayStart = startOfGymDay(now);
    const threeDaysFromNow = endOfGymDay(toGymDateTime(now).plus({ days: 3 }).toJSDate());
    const threeDaysAgo = toGymDateTime(now).minus({ days: 3 }).toUTC().toJSDate();
    const sevenDaysAgo = startOfGymDay(toGymDateTime(now).minus({ days: 7 }).toJSDate());
    const fourteenDaysAgo = toGymDateTime(now).minus({ days: 14 }).toUTC().toJSDate();

    switch (type) {

        // ----------------------------------------------------
        // 1. (Expiring Soon)
        // ----------------------------------------------------
        case "expiring":
            query = {
                subscriptionEndDate: {
                    $lte: threeDaysFromNow,
                    $gte: todayStart
                },
                'crmInfo.whatsappOptIn': true,

                $or: [
                    { 'crmInfo.lastMessageSent': null },
                    { 'crmInfo.lastMessageSent': { $exists: false } },
                    { 'crmInfo.lastMessageSent': { $lt: todayStart } }
                ]
            }
            break;

        // ----------------------------------------------------
        // 2. debt
        // ----------------------------------------------------


        case "debt":
            query = {
                $or: [
                    { 'crmInfo.lastMessageSent': null },
                    { 'crmInfo.lastMessageSent': { $exists: false } },
                    { 'crmInfo.lastMessageSent': { $lt: threeDaysAgo } }
                ]
            }
            break;

        // ----------------------------------------------------
        // 3. Absence
        // ----------------------------------------------------

        case "absence":
            query = {
                lastAttendance: { $lt: sevenDaysAgo },
                subscriptionEndDate: { $gte: todayStart },
                $or: [
                    { 'crmInfo.lastMessageType': { $ne: 'absent' } },
                    { 'crmInfo.lastMessageSent': { $lt: fourteenDaysAgo } } //14 days
                ]
            }
            break;

        default:
            throw new Error("Invalid target type");
    }




    const results = await Trainees.find({ ...query, deleteFlag: false })
        .select('name phone subscriptionEndDate accountFreezeStatus freezeStartDate memberId totalCost discount billingCycleId');
    const summaries = await getLedgerSummaryMap(PaymentTransaction, results);
    const withSummaries = type === 'debt'
        ? results.filter(t => (summaries.get(String(t._id))?.outstandingMinor ?? 0) > 0)
        : results;

    return withSummaries.map(t => {
        const summary = summaries.get(String(t._id));
        return {
            id: t._id,
            name: t.name,
            phone: t.phone,
            daysLeft: t.daysLeft,
            amountDue: (summary?.outstandingMinor ?? 0) / 100,
            memberId: t.memberId,
            type: type
        };
    });




}

export const sendToN8N = async (targets: any[], webhookUrl: string) => {
    if (targets.length === 0) return;
    try {
        const N8N_API_SECRET = process.env.N8N_API_SECRET
        if (!N8N_API_SECRET) {
            throw new Error("Couldn't load n8n API key")
        }
        await axios.post(webhookUrl, {
            batch: targets,
            timestamp: utcNowIso()
        }, {
            headers: { "key": process.env.N8N_API_SECRET }
        });
    } catch (e) {
        console.error("N8N Error", e);
    }
}
