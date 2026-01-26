import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardRawData } from '../../slices/dashboardSlice';

const GlobalDataLoader: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    // بنراقب الداتا والعلم
    const { raw, needsRefresh } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        // الحالة 1: التطبيق لسه فاتح والداتا فاضية -> هات الداتا
        if (!raw) {
            dispatch(fetchDashboardRawData());
        }

        // الحالة 2: معانا داتا، بس حصل أكشن (إضافة/تجميد/...) ورفعنا العلم -> جدد الداتا
        if (raw && needsRefresh) {
            // ده اسمه Silent Refresh (تحديث في الخلفية)
            dispatch(fetchDashboardRawData());
        }
    }, [dispatch, raw, needsRefresh]);

    return null; // الكومبوننت ده خفي ومجرد لوجيك
};

export default GlobalDataLoader;