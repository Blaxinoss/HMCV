import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define Interfaces for Sub-documents (Cleanliness)
interface IAppliedDiscount {
    hasCustomDiscount: boolean;
    discountValue: number;
    discountType: 'fixed' | 'percentage';
    expiryDate?: Date;
    reason?: string;
}

interface IAttendanceEntry {
    checkIn: Date;
    _id?: mongoose.Types.ObjectId; // Mongoose adds this automatically
}

interface ICrmInfo {
    whatsappOptIn: boolean;
    lastMessageSent?: Date;
    lastMessageType?: string;
}

// 2. Define the Main Interface (The shape of the data in DB)
export interface ITrainee {
    memberId?: number;
    name: string;
    phone: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
    totalCost: number;
    paid: number;
    remaining: number;
    discount: number;
    deleteFlag: boolean;
    accountFreezeStatus: boolean;
    freezeStartDate?: Date | null;
    isSession: boolean;
    sessionsRemaining: number;
    appliedDiscount: IAppliedDiscount;
    attendanceHistory: IAttendanceEntry[];
    lastAttendance?: Date | null;
    usedCoupon?: string;
    crmInfo: ICrmInfo;
    createdAt: Date;
    updatedAt: Date;
}

// 3. Define Virtuals (Computed properties)
interface ITraineeVirtuals {
    daysLeft: number | null;
}

// 4. Define Methods (Instance methods, if you add any later)
interface ITraineeMethods {
    // e.g., sendWhatsApp(): Promise<void>;
}

// 5. Combine into a Model Type
type TraineeModel = Model<ITrainee, {}, ITraineeMethods, ITraineeVirtuals>;

// 6. Define the Schema
const TraineeSchema = new Schema<ITrainee, TraineeModel, ITraineeMethods, ITraineeVirtuals>(
    {
        memberId: {
            type: Number,
            unique: true,
            sparse: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            match: [/^\d{10,15}$/, 'Please provide a valid phone number'],
            index: true,
        },
        subscriptionStartDate: {
            type: Date,
            required: true,
        },
        subscriptionEndDate: {
            type: Date,
            required: true,
            index: true,
        },
        totalCost: {
            type: Number,
            required: true,
            min: 0,
        },
        paid: {
            type: Number,
            default: 0,
            min: 0,
        },
        remaining: {
            type: Number,
            default: 0,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        deleteFlag: {
            type: Boolean,
            default: false,
        },
        accountFreezeStatus: {
            type: Boolean,
            default: false,
        },
        freezeStartDate: {
            type: Date,
            default: null,
        },
        isSession: {
            type: Boolean,
            default: false,
        },
        sessionsRemaining: { type: Number, default: 0 },
        appliedDiscount: {
            hasCustomDiscount: { type: Boolean, default: false },
            discountValue: { type: Number, default: 0 },
            discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
            expiryDate: { type: Date },
            reason: { type: String },
        },
        attendanceHistory: [
            {
                checkIn: { type: Date, default: Date.now },
            },
        ],
        lastAttendance: { type: Date },
        crmInfo: {
            whatsappOptIn: { type: Boolean, default: true },
            lastMessageSent: { type: Date },
            lastMessageType: { type: String },
        },
        usedCoupon: { type: String, default: null }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// 7. Implement Virtuals
TraineeSchema.virtual('daysLeft').get(function (this: ITrainee) {
    if (!this.subscriptionEndDate) return null;
    const today = new Date();
    const difference = new Date(this.subscriptionEndDate).getTime() - today.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return daysLeft;
});

// 8. Implement Pre-Save Hook
TraineeSchema.pre('save', function (next) {
    // 1. Calculate Remaining Balance
    if (this.isModified('totalCost') || this.isModified('paid') || this.isModified('discount')) {
        this.remaining = this.totalCost - (this.paid + this.discount);
    }

    // 2. Update Last Attendance
    // We check if the history exists and has items
    if (this.isModified('attendanceHistory') && this.attendanceHistory?.length > 0) {
        const lastEntry = this.attendanceHistory[this.attendanceHistory.length - 1];

        // Update: Safe assignment using optional chaining
        this.lastAttendance = lastEntry?.checkIn ?? null;
    }

    next();
});

// 9. Export the Model
const Trainees = mongoose.model<ITrainee, TraineeModel>('Trainees', TraineeSchema);

export default Trainees;