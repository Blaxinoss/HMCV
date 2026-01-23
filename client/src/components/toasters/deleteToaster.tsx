import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const useConfirmToast = () => {
  const { t } = useTranslation();

  const showConfirm = (id: string, onConfirm: (id: string) => void) => {
    toast((te) => (
      <div className="flex flex-col gap-4 p-1"> {/* دعم العربي */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex flex-col">
            <p className="font-bold text-white text-sm">
              {t('common.confirm_action')}
            </p>
            <p className="text-gray-400 text-xs">
              {t('common.confirm_message')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => toast.dismiss(te.id)}
            className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-all"
          >
            {t('common.cancel')}
          </button>

          <button
            onClick={() => {
              toast.dismiss(te.id);
              onConfirm(id); // 👈 هنا بننفذ الدالة اللي بعتناها
              toast.success(t('common.success_action'));
            }}
            className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-all"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: { background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', minWidth: '320px' },
    });
  };

  return { showConfirm };
};