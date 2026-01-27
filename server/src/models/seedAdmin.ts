import User from '../models/User.js'; // تأكد من المسار
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
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

export default seedAdmin;