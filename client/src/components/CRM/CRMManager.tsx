import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api'; // Axios instance
import toast from 'react-hot-toast';
import {
    BellRing,
    DollarSign,
    UserX,
    Send,
    Loader2,
    CheckCircle
} from 'lucide-react';

const CRMManager: React.FC = () => {
    const { t } = useTranslation();
    const [loadingType, setLoadingType] = useState<string | null>(null);

    // دالة موحدة لتشغيل أي نوع
    const handleTrigger = async (type: string) => {
        setLoadingType(type);
        try {
            const response = await api.post('/marketing/trigger-reminders', { type });

            if (response.data.count > 0) {
                toast.success(t('crm.success_message', { count: response.data.count }));
            } else {
                toast('No targets found for this category today.', { icon: 'ℹ️' });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to trigger campaign");
        } finally {
            setLoadingType(null);
        }
    };

    // بيانات الكروت عشان منكررش الكود
    const campaigns = [
        {
            type: 'expiring',
            title: t('crm.expiring_title'),
            description: t('crm.expiring_description'),
            icon: BellRing,
            color: 'blue',
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20'
        },
        {
            type: 'debt',
            title: t('crm.debt_title'),
            description: t('crm.debt_description'),
            icon: DollarSign,
            color: 'red',
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500/20'
        },
        {
            type: 'absence',
            title: t('crm.absence_title'),
            description: t('crm.absence_description'),
            icon: UserX,
            color: 'orange',
            bg: 'bg-orange-500/10',
            text: 'text-orange-500',
            border: 'border-orange-500/20'
        }
    ];

    return (
        <div className="relative group max-h-screen">
            {/* الطبقة المموّهة (الداشبورد بتاعتك) */}
            <div className="p-6 lg:p-10 bg-gray-950 text-white font-sans blur-[6px] pointer-events-none select-none">
                {/* كود الداشبورد القديم بتاعك هنا */}

                <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans ">

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-3">
                            <Send className="w-8 h-8 text-purple-500" />
                            {t('crm.header')}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {t('crm.subtitle')}
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.type}
                                className={`bg-gray-900 border rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl group ${campaign.border}`}
                            >
                                {/* Icon Header */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${campaign.bg} ${campaign.text}`}>
                                    <campaign.icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{campaign.title}</h3>
                                <p className="text-gray-400 text-sm mb-8 h-10 leading-relaxed">
                                    {campaign.description}
                                </p>

                                {/* Action Button */}
                                <button
                                    onClick={() => alert('good try')}
                                    disabled={true}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${loadingType === campaign.type
                                            ? 'bg-gray-800 text-gray-400 cursor-wait'
                                            : `bg-gray-800 hover:${campaign.bg} text-white hover:${campaign.text} border border-gray-700 hover:${campaign.border}`
                                        }
              `}
                                >
                                    {loadingType === campaign.type ? (
                                        <> <Loader2 className="w-5 h-5 animate-spin" /> {t('crm.processing')} </>
                                    ) : (
                                        <> {t('crm.run_button')} <Send className="w-4 h-4" /> </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Info Note */}
                    <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-start gap-3">
                        <div className="p-1 bg-green-500/10 rounded-full mt-0.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-300">{t('crm.system_note_title')}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {t('crm.system_note_description')}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* الطبقة اللي فوق اللي فيها الرسالة */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/40 transition-all duration-300 group-hover:bg-gray-950/20">
                <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl backdrop-blur-[0.25px] text-center shadow-2xl">
                    <span className="text-yellow-500 text-2xl mb-2 block">🔒</span>
                    <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-wider">Premium Feature</h3>

                </div>
            </div>
        </div>
    );
};

export default CRMManager;