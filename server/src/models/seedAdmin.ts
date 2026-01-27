import bcrypt from 'bcrypt';
import type { Model } from 'mongoose';
import type { IUser } from './User.js';


import express from 'express';
import { db } from './index.js';

const seedAdmin = async (User: Model<IUser>) => {
    try {
        // 1. دور هل فيه أي أدمن موجود ولا لأ؟
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('✅ Admin account already exists.');
            return; // خلاص مش محتاجين نعمل حاجة
        }

        // 2. لو مفيش، هات البيانات من الـ .env
        const username = process.env.DEFAULT_ADMIN_USERNAME;
        const password = process.env.DEFAULT_ADMIN_PASSWORD;

        if (!username || !password) {
            console.error('❌ DEFAULT_ADMIN credentials are missing in .env file');
            return;
        }

        // 3. شفر الباسورد (مهم جداً!)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. اخلق الأدمن الأول
        const newAdmin = new User({
            username: username,
            password: hashedPassword,
            role: 'admin' // ده أهم سطر
        });

        await newAdmin.save();
        console.log(`🎉 Default Admin created successfully! Username: ${username}`);

    } catch (error) {
        console.error('❌ Failed to seed admin:', error);
    }
};



const router = express.Router();

// هذا الراوت خطير! لازم نحميه بـ Secret Key
router.post('/init-tenant', async (req, res) => {
    // 1. حماية بسيطة عشان مش أي حد معدي يعمل ريسيت للادمن
    const systemSecret = req.headers['x-system-secret'];
    if (systemSecret !== process.env.SYSTEM_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Wrong System Secret' });
    }

    try {
        const { User } = db(req);

        await seedAdmin(User);

        res.json({ success: true, message: 'Tenant initialized & Admin seeded 🚀' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;