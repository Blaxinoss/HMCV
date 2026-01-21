import mongoose from 'mongoose'
mongoose.connect("mongodb://localhost:27017/HMCV");

const TraineeSchema = new mongoose.Schema({
    name: String,
    phone: String,
    memberId: String,
    subscriptionEndDate: Date,
    lastAttendance: Date,
    remaining: Number,
    crmInfo: {
        whatsappOptIn: Boolean,
        lastMessageSent: Date,
        lastMessageType: String
    }
});

const Trainees = mongoose.model("Trainees", TraineeSchema);

const today = new Date();

const daysAgo = (d: any) => {
    const date = new Date();
    date.setDate(today.getDate() - d);
    return date;
};

const daysFromNow = (d: any) => {
    const date = new Date();
    date.setDate(today.getDate() + d);
    return date;
};

const data = [

    // --------------------------------------------------
    // ✅ EXPIRING
    // --------------------------------------------------
    {
        name: "Ahmed Expiring",
        phone: "+201000000001",
        memberId: "M001",
        subscriptionEndDate: daysFromNow(2),
        remaining: 0,
        lastAttendance: daysAgo(1),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageSent: daysAgo(2)
        }
    },

    // --------------------------------------------------
    // ❌ SHOULD NOT APPEAR (expiring but message sent today)
    // --------------------------------------------------
    {
        name: "Blocked Expiring",
        phone: "+201000000002",
        memberId: "M002",
        subscriptionEndDate: daysFromNow(1),
        remaining: 0,
        lastAttendance: daysAgo(1),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageSent: today
        }
    },

    // --------------------------------------------------
    // ✅ DEBT
    // --------------------------------------------------
    {
        name: "Sara Debt",
        phone: "+201000000003",
        memberId: "M003",
        subscriptionEndDate: daysFromNow(15),
        remaining: 300,
        lastAttendance: daysAgo(2),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageSent: daysAgo(5)
        }
    },

    // --------------------------------------------------
    // ❌ SHOULD NOT APPEAR (recent debt message)
    // --------------------------------------------------
    {
        name: "Blocked Debt",
        phone: "+201000000004",
        memberId: "M004",
        subscriptionEndDate: daysFromNow(10),
        remaining: 500,
        lastAttendance: daysAgo(1),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageSent: daysAgo(1)
        }
    },

    // --------------------------------------------------
    // ✅ ABSENCE (never sent absent message)
    // --------------------------------------------------
    {
        name: "Omar Absent",
        phone: "+201000000005",
        memberId: "M005",
        subscriptionEndDate: daysFromNow(20),
        remaining: 0,
        lastAttendance: daysAgo(10),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageType: "promo",
            lastMessageSent: daysAgo(20)
        }
    },

    // --------------------------------------------------
    // ✅ ABSENCE (sent absent long ago)
    // --------------------------------------------------
    {
        name: "Mona Absent Old",
        phone: "+201000000006",
        memberId: "M006",
        subscriptionEndDate: daysFromNow(30),
        remaining: 0,
        lastAttendance: daysAgo(9),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageType: "absent",
            lastMessageSent: daysAgo(20)
        }
    },

    // --------------------------------------------------
    // ❌ SHOULD NOT APPEAR (recent absent message)
    // --------------------------------------------------
    {
        name: "Blocked Absent",
        phone: "+201000000007",
        memberId: "M007",
        subscriptionEndDate: daysFromNow(30),
        remaining: 0,
        lastAttendance: daysAgo(10),
        crmInfo: {
            whatsappOptIn: true,
            lastMessageType: "absent",
            lastMessageSent: daysAgo(5)
        }
    }
];

async function seed() {
    await Trainees.deleteMany({});
    await Trainees.insertMany(data);
    console.log("✅ Trainees seeded & covering all automation cases");
    process.exit();
}

seed();
