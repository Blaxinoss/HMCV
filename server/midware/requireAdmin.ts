import type { NextFunction, Request, Response } from "express";


export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}


export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user?.role === "admin") {
        next();
    } else {
        return res.status(403).json({ error: "Access denied: Admins only" });
    }

}