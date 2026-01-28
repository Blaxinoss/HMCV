import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';
import { addTrainee, checkInTrainee, deleteTrainee, freezeTrainee, patchTrainee, renewTrainee, updateTrainee } from './subscriptionSlice';
import { addExpense, deleteExpense, updateExpense } from './expensesSlice';
import { addTrainer, deleteTrainer, updateTrainer } from './trainersSlice';
// import { DashboardState } from '../types'; // ممكن نستغنى عنها ونعرف الـ State هنا لو التايب القديم مختلف

// 1. تعريف شكل الداتا الخام
export interface RawData {
    trainees: any[];
    expenses: any[];
    trainers: any[];
}

// 2. تعريف حالة السلايس
interface DashboardSliceState {
    raw: RawData | null;
    loading: boolean;
    error: string | null;
    needsRefresh: boolean; // 👈 العلم المهم
}

// 3. الـ Thunk لجلب الداتا
export const fetchDashboardRawData = createAsyncThunk<
    RawData,
    void,
    { rejectValue: string }
>(
    'dashboard/fetchRaw',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/raw-data');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch data');
        }
    }
);

const initialState: DashboardSliceState = {
    raw: null,
    loading: false,
    error: null,
    needsRefresh: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // --- التعامل مع الفيتش الأساسي ---
        builder
            .addCase(fetchDashboardRawData.pending, (state) => {
                // ✅ الذكاء هنا: لو الداتا موجودة أصلاً، متعملش Loading
                // عشان اليوزر ميشوفش وميض (Flicker) والعملية تتم في الخلفية
                if (!state.raw) {
                    state.loading = true;
                }
            })
            .addCase(fetchDashboardRawData.fulfilled, (state, action: PayloadAction<RawData>) => {
                state.loading = false;
                state.raw = action.payload; // تحديث الداتا
                state.needsRefresh = false; // ✅ نزل العلم، خلاص حدثنا
                state.error = null;
            })
            .addCase(fetchDashboardRawData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // --- التعامل مع التريجر (الأكشنز اللي بتغير الداتا) ---
        const triggerActions = [
            addTrainee.fulfilled, deleteTrainee.fulfilled, updateTrainee.fulfilled, renewTrainee.fulfilled,
            addExpense.fulfilled, deleteExpense.fulfilled, updateExpense.fulfilled,
            addTrainer.fulfilled, updateTrainer.fulfilled, deleteTrainer.fulfilled,
            checkInTrainee.fulfilled, freezeTrainee.fulfilled,
            patchTrainee.fulfilled,
        ];

        // ✅ اللوب الكاملة
        triggerActions.forEach(action => {
            builder.addCase(action, (state) => {
                // 🚩 ارفع العلم: الداتا قدمت ومحتاجة تحديث
                state.needsRefresh = true;

                // ⚠️ ملحوظة: إياك تعمل state.raw = null هنا
                // سيب الداتا القديمة معروضة لحد ما الجديدة تيجي في الخلفية
            });
        });
    }
});

export default dashboardSlice.reducer;