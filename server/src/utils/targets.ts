
import axios from 'axios';
import type { Model } from 'mongoose';
import type { ITrainee } from '../models/Trainees.js';
export const getTargets = async (type: string, Trainees: Model<ITrainee>) => {


    let query = {}
    let targets = []

    const today = new Date();

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);

    switch (type) {

        // ----------------------------------------------------
        // 1. (Expiring Soon)
        // ----------------------------------------------------
        case "expiring":
            query = {
                subscriptionEndDate: {
                    $lte: threeDaysFromNow,
                    $gt: yesterday
                },
                'crmInfo.whatsappOptIn': true,

                $or: [
                    { 'crmInfo.lastMessageSent': null },
                    { 'crmInfo.lastMessageSent': { $exists: false } },
                    { 'crmInfo.lastMessageSent': { $lt: yesterday } }
                ]
            }
            break;

        // ----------------------------------------------------
        // 2. debt
        // ----------------------------------------------------


        case "debt":
            query = {
                remaining: { $gt: 0 },
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
                subscriptionEndDate: { $gt: today },
                $or: [
                    { 'crmInfo.lastMessageType': { $ne: 'absent' } },
                    { 'crmInfo.lastMessageSent': { $lt: fourteenDaysAgo } } //14 days
                ]
            }
            break;

        default:
            throw new Error("Invalid target type");
    }




    const results = await Trainees.find(query).select('name phone subscriptionEndDate memberId remaining');
    return results.map(t => {
        return {
            id: t._id,
            name: t.name,
            phone: t.phone,
            daysLeft: t.daysLeft,
            amountDue: t.remaining || 0,
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
            timestamp: new Date().toISOString()
        }, {
            headers: { "key": process.env.N8N_API_SECRET }
        });
    } catch (e) {
        console.error("N8N Error", e);
    }
}