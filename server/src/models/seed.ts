import mongoose from "mongoose";
import Trainees from "./Trainees.js";// تأكد من المسار الصحيح
import dotenv from 'dotenv';

dotenv.config(); // عشان يقرا ملف .env

// ============================================================================
// 🛠️ Helper Functions
// ============================================================================

const getStartOfDay = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getEndOfDay = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(23, 59, 59, 999);
    return d;
};

// ============================================================================
// 🎯 Default Values
// ============================================================================
const defaults = {
    discount: 0,
    deleteFlag: false,
    appliedDiscount: { hasCustomDiscount: false, discountValue: 0, discountType: 'fixed' },
    attendanceHistory: [],
    crmInfo: { whatsappOptIn: true, status: 'New' },
    lastAttendance: null,
    isSession: false,
    sessionsRemaining: 0,
    usedCoupon: null
};

// ============================================================================
// 🚀 Seed Function
// ============================================================================
const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/HMCV");
        console.log('🔌 Connected to MongoDB...\n');

        await Trainees.deleteMany({});
        console.log('🧹 Cleared existing data...\n');

        const testCases = [
            // ========== BASIC FREEZE TESTS ==========

            // 1️⃣ Standard Freeze (5 days)
            // سيناريو: اشترك من شهر، ويخلص كمان شهر، واتجمد من 5 أيام.
            {
                ...defaults,
                memberId: 901,
                name: "FZ01 Standard Frozen",
                phone: "01090000001",
                subscriptionStartDate: getStartOfDay(-30),
                subscriptionEndDate: getEndOfDay(30),
                totalCost: 500, paid: 500,
                accountFreezeStatus: true,
                freezeStartDate: getStartOfDay(-5)
                // Expected: daysLeft = 35 (30 + 5)
            },

            // 2️⃣ Zombie User (expired but frozen)
            // سيناريو: اشتراكه خلص امبارح، بس هو مجمد بقاله 10 أيام.
            // ده "الميت الحي". لازم السيستم يحفظ له أيامه.
            {
                ...defaults,
                memberId: 902,
                name: "FZ02 Zombie User",
                phone: "01090000002",
                subscriptionStartDate: getStartOfDay(-60),
                subscriptionEndDate: getEndOfDay(-1),
                totalCost: 500, paid: 500,
                accountFreezeStatus: true,
                freezeStartDate: getStartOfDay(-10)
                // Expected: daysLeft = 9 (كان فاضل 9 أيام لما جمد)
            },

            // 3️⃣ Just Frozen Today
            // لسه مجمد حالا.
            {
                ...defaults,
                memberId: 903,
                name: "FZ03 Just Frozen",
                phone: "01090000003",
                subscriptionStartDate: getStartOfDay(-10),
                subscriptionEndDate: getEndOfDay(20),
                totalCost: 500, paid: 500,
                accountFreezeStatus: true,
                freezeStartDate: getStartOfDay(0)
                // Expected: daysLeft = 20
            },

            // 4️⃣ Captain America (1 Year Freeze)
            // مجمد من سنة، وكان فاضله 5 أيام.
            {
                ...defaults,
                memberId: 907,
                name: "FZ07 Captain America",
                phone: "01090000007",
                subscriptionStartDate: getStartOfDay(-400),
                subscriptionEndDate: getEndOfDay(-365),
                totalCost: 500, paid: 500,
                accountFreezeStatus: true,
                freezeStartDate: getStartOfDay(-370)
                // Expected: daysLeft = 5
            },

            // ========== ACTIVE & EXPIRED ==========

            // 5️⃣ Normal Active
            {
                ...defaults,
                memberId: 914,
                name: "ACT01 Normal Active",
                phone: "01090000014",
                subscriptionStartDate: getStartOfDay(-10),
                subscriptionEndDate: getEndOfDay(20),
                totalCost: 500, paid: 500,
                accountFreezeStatus: false
            },

            // 6️⃣ Expired
            {
                ...defaults,
                memberId: 915,
                name: "EXP01 Expired",
                phone: "01090000015",
                subscriptionStartDate: getStartOfDay(-60),
                subscriptionEndDate: getEndOfDay(-5),
                totalCost: 500, paid: 500,
                accountFreezeStatus: false
            },

            // ========== FINANCIAL ==========

            // 7️⃣ User with Debt
            {
                ...defaults,
                memberId: 921,
                name: "FIN01 With Debt",
                phone: "01090000021",
                subscriptionStartDate: getStartOfDay(-5),
                subscriptionEndDate: getEndOfDay(25),
                totalCost: 1000, paid: 500,
                accountFreezeStatus: false
                // Expected: remaining = 500
            }
        ];

        console.log('🚀 Starting to seed data with pre-save hook...\n');

        let successCount = 0;

        // Use loop to trigger pre-save hook
        for (const data of testCases) {
            try {
                const trainee = new Trainees(data);
                await trainee.save(); // 🔥 Hook runs here
                successCount++;
            } catch (error: any) {
                console.error(`❌ Failed to create ${data.name}:`, error.message);
            }
        }

        console.log(`\n✅ Successfully seeded ${successCount} records.\n`);

        // ============================================================================
        // 🔍 Verification Step (Database Check)
        // ============================================================================
        console.log('🔍 VERIFYING DATABASE STATE (Checking Hooks)...');
        console.log('--------------------------------------------------');

        const fz01 = await Trainees.findOne({ memberId: 901 });
        console.log(`🥶 FZ01 (Standard): DaysLeft = ${fz01?.daysLeft} (Expected: ~35)`);

        const fz02 = await Trainees.findOne({ memberId: 902 });
        console.log(`🧟 FZ02 (Zombie):   DaysLeft = ${fz02?.daysLeft} (Expected: ~9)`);

        const fz07 = await Trainees.findOne({ memberId: 907 });
        console.log(`🛡️ FZ07 (Captain):  DaysLeft = ${fz07?.daysLeft} (Expected: ~5)`);

        const fin01 = await Trainees.findOne({ memberId: 921 });
        console.log(`💰 FIN01 (Debt):    Remaining = ${fin01?.remaining} (Expected: 500)`);

        console.log('--------------------------------------------------');
        console.log('🎉 Verification Complete. Ready for Frontend Testing!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
};

seedData();