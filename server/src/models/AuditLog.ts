import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    entity: string;
    entityId: string;
    actorUserId?: mongoose.Types.ObjectId;
    requestId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    createdAt: Date;
}

export const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true, index: true },
        entity: { type: String, required: true, index: true },
        entityId: { type: String, required: true, index: true },
        actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        requestId: { type: String, index: true },
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
