import type { Request, Response, NextFunction } from 'express';

const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
    // Get API key from headers
    const apiKey = req.headers['key'];

    // Get valid API key from environment
    const validApiKey = process.env.N8N_API_SECRET;

    // Compare keys
    if (apiKey && apiKey === validApiKey) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Forbidden: Invalid or missing API Key',
        });
    }
};

export default requireApiKey;
