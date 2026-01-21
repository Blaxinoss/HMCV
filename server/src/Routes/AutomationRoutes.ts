import { Router } from "express";
import type { Request, Response } from "express";
import Trainees from "../models/Trainees.js";


const router = Router()

router.get("/targets", async (req: Request, res, Response) => {

    const { type } = req.query;
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
            return res.status(400).json({ success: false, message: "Invalid type parameter" });
    }

    try {


        const results = await Trainees.find(query).select('name phone subscriptionEndDate memberId remaining');
        targets = results.map(t => {
            const endDate = t.subscriptionEndDate ? new Date(t.subscriptionEndDate).getTime() : 0;
            const now = new Date().getTime();
            const diffTime = endDate - now;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: t._id,
                name: t.name,
                phone: t.phone,
                daysLeft: daysLeft,
                amountDue: t.remaining || 0,
                memberId: t.memberId
            };
        });

        res.status(200).json({
            success: true,
            count: targets.length,
            data: targets
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// POST /api/automation/log/:id
// n8n Call: When message is sent successfully
router.post("/log/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { messageType } = req.body; // n8n sends: 'expiring', 'debt', 'welcome', etc.

        // تحديث سجل التواصل
        await Trainees.findByIdAndUpdate(id, {
            $set: {
                'crmInfo.lastMessageSent': new Date(), // سجلنا تاريخ اللحظة دي
                'crmInfo.lastMessageType': messageType || 'general'
            }
        });

        res.status(200).json({ success: true, message: "Communication logged" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});



export default router;