import mongoose, { type Model } from 'mongoose';
import type { IAuditLog } from '../models/AuditLog.js';

export async function recordAudit({
    auditLogModel,
    action,
    entity,
    entityId,
    actorUserId,
    requestId,
    before,
    after,
    session,
}: {
    auditLogModel: Model<IAuditLog>;
    action: string;
    entity: string;
    entityId: string;
    actorUserId?: mongoose.Types.ObjectId;
    requestId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    session?: mongoose.ClientSession;
}): Promise<void> {
    await auditLogModel.create(
        [{ action, entity, entityId, actorUserId, requestId, before, after }],
        session ? { session } : undefined,
    );
}
