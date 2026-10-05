import { Router, type Request, type Response } from 'express';
import { db } from '../models/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { AuditLog } = db(req);
        const requestedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
        const requestedLimit = Number.parseInt(String(req.query.limit ?? '20'), 10);
        const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
        const limit = Number.isFinite(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 100)
            : 20;

        const filter: Record<string, string> = {};
        if (typeof req.query.action === 'string' && req.query.action.trim()) {
            filter.action = req.query.action.trim();
        }
        if (typeof req.query.entity === 'string' && req.query.entity.trim()) {
            filter.entity = req.query.entity.trim();
        }

        const [logs, totalItems] = await Promise.all([
            AuditLog.find(filter)
                .populate('actorUserId', 'username role')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        });
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
});

export default router;
