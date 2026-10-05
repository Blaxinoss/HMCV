import type { NextFunction, Request, Response } from 'express';

type Attempt = { count: number; resetAt: number };

const attempts = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function loginRateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = `${req.ip}:${String(req.body?.username || '').trim().toLowerCase()}`;
    const now = Date.now();
    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        next();
        return;
    }

    if (current.count >= MAX_ATTEMPTS) {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again later.',
            errorCode: 'AUTH_RATE_LIMITED',
        });
        return;
    }

    current.count += 1;
    next();
}

export function clearLoginRateLimit(): void {
    attempts.clear();
}
