import mongoose, { Schema, Document, Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { calculateMembershipDaysLeft, utcNow } from '../utils/dateTime.js';

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

interface IFreezeHistoryEntry {
    action: 'freeze' | 'unfreeze';
    actorUserId?: mongoose.Types.ObjectId;
    reason: string;
    effectiveDate: Date;
    previousEndDate: Date;
    resultingEndDate: Date;
    createdAt: Date;
}

// 2. Define the Main Interface (The shape of the data in DB)
export interface ITrainee {
    memberId?: number;
    name: string;
    phone: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
    billingCycleId: string;
    totalCost: number;
    discount: number;
    deleteFlag: boolean;
    deletedAt?: Date | null;
    deletedBy?: mongoose.Types.ObjectId | null;
    accountFreezeStatus: boolean;
    freezeStartDate?: Date | null;
    freezeHistory: IFreezeHistoryEntry[];
    isSession: boolean;
    program: string;
    sessionsRemaining: number;
    appliedDiscount: IAppliedDiscount;
    daysLeft: number;
    attendanceHistory: IAttendanceEntry[];
    lastAttendance?: Date | null;
    usedCoupon?: string;
    crmInfo: ICrmInfo;
    createdAt: Date;
    updatedAt: Date;
}

// // 3. Define Virtuals (Computed properties)
// interface ITraineeVirtuals {
//     daysLeft: number | null;
// }

// 4. Define Methods (Instance methods, if you add any later)
interface ITraineeMethods {
    // e.g., sendWhatsApp(): Promise<void>;
}

// 5. Combine into a Model Type
type TraineeModel = Model<ITrainee, {}, ITraineeMethods>;

// 6. Define the Schema
export const TraineeSchema = new Schema<ITrainee, TraineeModel, ITraineeMethods>(
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
        billingCycleId: {
            type: String,
            required: true,
            default: randomUUID,
            index: true,
        },
        totalCost: {
            type: Number,
            required: true,
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
        deletedAt: {
            type: Date,
            default: null,
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        accountFreezeStatus: {
            type: Boolean,
            default: false,
        },
        freezeStartDate: {
            type: Date,
            default: null,
        },
        freezeHistory: [
            {
                action: { type: String, enum: ['freeze', 'unfreeze'], required: true },
                actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
                reason: { type: String, required: true, trim: true, maxlength: 500 },
                effectiveDate: { type: Date, required: true },
                previousEndDate: { type: Date, required: true },
                resultingEndDate: { type: Date, required: true },
                createdAt: { type: Date, default: utcNow },
            },
        ],
        program: {
            type: String,
            default: "",
            trim: true,
            maxLength: 5000,
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
                checkIn: { type: Date, default: utcNow },
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
        optimisticConcurrency: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

TraineeSchema.virtual('daysLeft').get(function (this: ITrainee) {
    if (!this.subscriptionEndDate) return 0;

    return calculateMembershipDaysLeft(
        this.subscriptionEndDate,
        utcNow(),
        this.accountFreezeStatus ? this.freezeStartDate : null,
    );
});

TraineeSchema.pre('save', function (next) {
    // ---------------------------------------------------
    // Update Last Attendance (For Smart Freeze)
    // ---------------------------------------------------
    if (this.isModified('attendanceHistory') && this.attendanceHistory?.length > 0) {
        const lastEntry = this.attendanceHistory[this.attendanceHistory.length - 1];
        this.lastAttendance = lastEntry?.checkIn ?? null;
    }

    next();
});
