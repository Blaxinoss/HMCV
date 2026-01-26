import mongoose, { Schema, Document, Model } from 'mongoose';

// Define Trainers Interface
export interface ITrainer extends Document {
    name: string;
    phone: number;
    salary: number;
    raise: number;
    deleteFlag: boolean;
    salaryAfterDiscount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Define Trainers Schema
const TrainersSchema = new Schema<ITrainer>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        phone: {
            type: Number,
            required: true,
            unique: true,
            validate: {
                validator: function (value: number) {
                    return /\d{10,15}/.test(value.toString());
                },
                message: 'Please provide a valid phone number',
            },
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
        },
        raise: {
            type: Number,
            default: 0,
            min: 0,
        },
        deleteFlag: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for salary after discount
TrainersSchema.virtual('salaryAfterDiscount').get(function (this: ITrainer) {
    return this.salary - (this.raise || 0);
});

// Export Trainers model
const Trainers = mongoose.model<ITrainer>('Trainers', TrainersSchema);

export default Trainers;
