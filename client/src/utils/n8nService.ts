import axios from 'axios';

// حط هنا رابط السيرفر بتاع n8n بتاعك
const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook';

export const triggerN8N = async (webhookPath: string, data: any) => {
    try {
        // بنبعت الداتا بطريقة Fire-and-Forget (يعني مش بنستنى الرد عشان منبطأش السيستم)
        // بس هنا هنعمل await عشان لو عايز تتأكد إنه وصل
        const response = await axios.post(`${N8N_BASE_URL}/${webhookPath}`, data);
        console.log(`✅ n8n Triggered [${webhookPath}]: Success`);
        return response.data;
    } catch (error: any) {
        console.error(`❌ n8n Trigger Failed [${webhookPath}]:`, error.message);
        // مش بنعمل throw error عشان العملية الأصلية (زي إضافة المشترك) متفشلش لو n8n واقع
        return null;
    }
};