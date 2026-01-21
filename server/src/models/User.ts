import mongoose, { Schema, Document, Model } from 'mongoose';

// Define User Interface
export interface IUser extends Document {
    username: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define User Schema
const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: 'user',
        }
    },
    {
        timestamps: true,
    }
);

// Export User model
const User = mongoose.model<IUser>('User', userSchema, 'users');

export default User;
