import mongoose from 'mongoose';
import Trainees from './Trainees.js';

// 1. الاتصال بقاعدة البيانات
const seedData = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/HMCV");
        console.log('📦 Connected to MongoDB...');

        // 1. مسح البيانات القديمة (اختياري)
        await Trainees.deleteMany({});
        console.log('🧹 Cleared old data...');

        // دوال مساعدة للتواريخ
        const today = new Date();
        const futureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const pastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const trainees = [
            // ---------------------------------------------------------
            // 1. المشترك المثالي (Active Time-Based)
            // ---------------------------------------------------------
            {
                memberId: 101,
                name: "أحمد كمال (مثالي)",
                phone: "01012345678",
                subscriptionStartDate: pastDate(5),
                subscriptionEndDate: futureDate(25),
                totalCost: 500,
                paid: 500,
                remaining: 0,
                discount: 0,
                isSession: false, // اشتراك شهري
                sessionsRemaining: 0,
                accountFreezeStatus: false,
                attendanceHistory: [
                    { checkIn: pastDate(4) },
                    { checkIn: pastDate(2) },
                    { checkIn: today }
                ],
                lastAttendance: today,
                crmInfo: { whatsappOptIn: true, lastMessageSent: pastDate(5), lastMessageType: "welcome" }
            },

            // ---------------------------------------------------------
            // 2. نظام حصص - رصيد كافي (Active Session)
            // ---------------------------------------------------------
            {
                memberId: 102,
                name: "سارة حسن (حصص)",
                phone: "01123456789",
                subscriptionStartDate: pastDate(2),
                subscriptionEndDate: futureDate(60), // صلاحية طويلة
                totalCost: 800,
                paid: 800,
                remaining: 0,
                isSession: true, // ✅ نظام حصص
                sessionsRemaining: 12, // ✅ رصيد 12 حصة
                attendanceHistory: [{ checkIn: pastDate(1) }],
                crmInfo: { whatsappOptIn: true }
            },

            // ---------------------------------------------------------
            // 3. نظام حصص - رصيد منخفض (Low Session Warning)
            // ---------------------------------------------------------
            {
                memberId: 103,
                name: "كريم مجدي (قرب يخلص)",
                phone: "01234567890",
                subscriptionStartDate: pastDate(20),
                subscriptionEndDate: futureDate(10),
                totalCost: 600,
                paid: 600,
                remaining: 0,
                isSession: true,
                sessionsRemaining: 1, // ⚠️ فاضله حصة واحدة
                attendanceHistory: [
                    { checkIn: pastDate(10) },
                    { checkIn: pastDate(5) },
                    { checkIn: pastDate(2) }
                ],
                crmInfo: { whatsappOptIn: false }
            },

            // ---------------------------------------------------------
            // 4. مديون (Debt)
            // ---------------------------------------------------------
            {
                memberId: 104,
                name: "محمود سعيد (مديون)",
                phone: "01555555555",
                subscriptionStartDate: today,
                subscriptionEndDate: futureDate(30),
                totalCost: 1000, // اشتراك غالي
                paid: 200,       // دفع جزء بسيط
                remaining: 800,  // 💸 عليه 800 جنيه
                isSession: false,
                crmInfo: { whatsappOptIn: true, lastMessageType: "payment_reminder" }
            },

            // ---------------------------------------------------------
            // 5. مجمد (Frozen)
            // ---------------------------------------------------------
            {
                memberId: 105,
                name: "علياء عادل (مجمد)",
                phone: "01099999999",
                subscriptionStartDate: pastDate(10),
                subscriptionEndDate: futureDate(20),
                totalCost: 500,
                paid: 500,
                remaining: 0,
                accountFreezeStatus: true, // 🧊 مجمد
                freezeStartDate: pastDate(2), // متجمد من يومين
                isSession: false,
                crmInfo: { whatsappOptIn: true }
            },

            // ---------------------------------------------------------
            // 6. منتهي الصلاحية (Expired Time)
            // ---------------------------------------------------------
            {
                memberId: 106,
                name: "خالد جمال (منتهي)",
                phone: "01111111111",
                subscriptionStartDate: pastDate(35),
                subscriptionEndDate: pastDate(5), // 📅 خلص من 5 أيام
                totalCost: 400,
                paid: 400,
                remaining: 0,
                isSession: false,
                crmInfo: { whatsappOptIn: true, lastMessageType: "renewal_reminder" }
            },

            // ---------------------------------------------------------
            // 7. مستخدم كوبون (Coupon User)
            // ---------------------------------------------------------
            {
                memberId: 107,
                name: "رامي سمير (كوبون)",
                phone: "01222222222",
                subscriptionStartDate: today,
                subscriptionEndDate: futureDate(30),
                totalCost: 1000,
                discount: 200, // خصم 200 جنيه
                paid: 800,
                remaining: 0,
                usedCoupon: "SUMMER20",
                appliedDiscount: {
                    hasCustomDiscount: true,
                    discountValue: 200,
                    discountType: 'fixed',
                    reason: 'Summer Offer'
                },
                isSession: false,
                crmInfo: { whatsappOptIn: true }
            }
        ];

        await Trainees.insertMany(trainees);
        console.log('🌱 Database Seeded Successfully with 7 Diverse Users!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();