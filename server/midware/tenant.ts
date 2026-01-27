


import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';
import type { Model, Connection, Schema } from 'mongoose';

const modelsCache = new Map<string, Model<any>>();

declare global {
    namespace Express {
        interface Request {
            getModel: <T>(modelName: string, schema: Schema<T>) => Model<T>;
        }
    }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {

        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            res.status(400).json({ error: 'Missing x-tenant-id header' });
            return;
        }

        const dbName = `gym_client_${tenantId}`;

        const tenantDb: Connection = mongoose.connection.useDb(dbName, { useCache: true });

        req.getModel = function <T>(modelName: string, schema: Schema<T>): Model<T> {
            const cacheKey = `${dbName}_${modelName}`;

            if (modelsCache.has(cacheKey)) {
                return modelsCache.get(cacheKey) as Model<T>;
            }

            const model = tenantDb.model<T>(modelName, schema);

            modelsCache.set(cacheKey, model);

            return model;

        }

        next();



    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ error: 'Failed to switch tenant context' });
    }
};

