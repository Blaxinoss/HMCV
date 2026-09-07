import express from 'express';
import type { Express } from 'express';
import mongoose, { mongo } from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors'
import traineeRoutes from './src/Routes/traineeRoutes.js';
import expensesRoutes from './src/Routes/expensesRoutes.js';
import trainersRoutes from './src/Routes/trainersRoutes.js';
import settingsRoutes from './src/Routes/userRoutes.js';
import dashboardRoutes from './src/Routes/dashboradRoutes.js'
import marketingRoutes from './src/Routes/marketingRoutes.js'
import authRoutes from './src/Routes/authRoutes.js';
import requireApi from './midware/requireApi.js';
import User from './src/models/User.js';
import { requireAdmin } from './midware/requireAdmin.js';
import verifyToken from './midware/verifyToken.js';
import seedAdmin from './src/models/seedAdmin.js';
import couponRoutes from './src/Routes/couponRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// CORS configuration
app.use(cors({
  origin: 'https://hustlecv.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

        await seedAdmin();
        console.log('✓ seeding admin account done ');


    })
    .catch((err: Error) => {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    });



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainees', verifyToken, requireAdmin, traineeRoutes);
app.use('/api/coupons', verifyToken, requireAdmin, couponRoutes);

app.use('/api/expenses', verifyToken, requireAdmin, expensesRoutes);
app.use('/api/trainers', verifyToken, requireAdmin, trainersRoutes);
app.use('/api/settings', verifyToken, requireAdmin, settingsRoutes);
app.use('/api/dashboard', verifyToken, requireAdmin, dashboardRoutes)
app.use('/api/marketing', verifyToken, requireAdmin, marketingRoutes);






// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        main:"kindaworking",
        timestamp: new Date().toISOString(),
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
