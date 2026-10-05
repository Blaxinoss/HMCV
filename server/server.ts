import express from 'express';
import type { Express } from 'express';
import mongoose, { mongo } from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors, { type CorsOptions } from 'cors'
import traineeRoutes from './src/Routes/traineeRoutes.js';
import expensesRoutes from './src/Routes/expensesRoutes.js';
import trainersRoutes from './src/Routes/trainersRoutes.js';
import settingsRoutes from './src/Routes/userRoutes.js';
import dashboardRoutes from './src/Routes/dashboradRoutes.js'
import marketingRoutes from './src/Routes/marketingRoutes.js'
import authRoutes from './src/Routes/authRoutes.js';
import { requireAdmin } from './midware/requireAdmin.js';
import verifyToken from './midware/verifyToken.js';
import seedAdminRoutes from './src/models/seedAdmin.js';
import { tenantMiddleware } from './midware/tenant.js';
import couponRoutes from './src/Routes/couponRoutes.js'
import auditRoutes from './src/Routes/auditRoutes.js';
import dns from 'dns';

// Force Node.js to use Google's DNS for this application only
dns.setServers(['8.8.8.8', '8.8.4.4']);
// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedOrigins = new Set([
    'https://hustlecv.vercel.app',
    'http://localhost:5173',
    ...configuredOrigins,
]);

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true,
    optionsSuccessStatus: 204,
};

// This middleware also answers preflight OPTIONS requests.
app.use(cors(corsOptions));
// Middleware
app.use(bodyParser.json());

// Get configuration from environment
const PORT = process.env.PORT || 5000;
const uri = process.env.DB_URI;

// MongoDB connection
if (!uri) {
    throw new Error('DB_URI is not defined in environment variables');
}

mongoose
    .connect(uri)
    .then(async () => {
        console.log('✓ MongoDB connected successfully');




    })
    .catch((err: Error) => {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    });


app.use(tenantMiddleware);
app.use('/seed', seedAdminRoutes)
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainees', verifyToken, requireAdmin, traineeRoutes);
app.use('/api/coupons', verifyToken, requireAdmin, couponRoutes);

app.use('/api/expenses', verifyToken, requireAdmin, expensesRoutes);
app.use('/api/trainers', verifyToken, requireAdmin, trainersRoutes);
app.use('/api/settings', verifyToken, requireAdmin, settingsRoutes);
app.use('/api/dashboard', verifyToken, requireAdmin, dashboardRoutes)
app.use('/api/marketing', verifyToken, requireAdmin, marketingRoutes);
app.use('/api/audit-logs', verifyToken, requireAdmin, auditRoutes);






// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

app.get('/health/live', (req, res) => {
    res.status(200).json({ success: true, status: 'live' });
});

app.get('/health/ready', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? 'ready' : 'not_ready',
        database: ready ? 'connected' : 'disconnected',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error('Unhandled error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
);

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ Auth endpoint: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`✓ Auth endpoint: POST http://localhost:${PORT}/api/auth/register`);
});

export default app;
