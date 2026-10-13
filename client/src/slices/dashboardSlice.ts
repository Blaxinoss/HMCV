import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';
import { DashboardData } from '../types';
import { addTrainee, checkInTrainee, deleteTrainee, freezeTrainee, patchTrainee, renewTrainee, updateTrainee } from './subscriptionSlice';
import { addExpense, deleteExpense, updateExpense } from './expensesSlice';
import { addTrainer, deleteTrainer, updateTrainer } from './trainersSlice';

interface DashboardSliceState {
    stats: DashboardData | null;
    loading: boolean;
    error: string | null;
    needsRefresh: boolean;
}

export const fetchDashboardStats = createAsyncThunk<
    DashboardData,
    { month: string },
    { rejectValue: string }
>(
    'dashboard/fetchStats',
    async ({ month }, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/stats', { params: { month } });
            return response.data.data as DashboardData;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard');
        }
    },
);

const initialState: DashboardSliceState = {
    stats: null,
    loading: false,
    error: null,
    needsRefresh: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardData>) => {
                state.loading = false;
                state.stats = action.payload;
                state.needsRefresh = false;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch dashboard';
            });

        const refreshTriggers = [
            addTrainee.fulfilled, deleteTrainee.fulfilled, updateTrainee.fulfilled,
            renewTrainee.fulfilled, checkInTrainee.fulfilled, freezeTrainee.fulfilled,
            patchTrainee.fulfilled, addExpense.fulfilled, deleteExpense.fulfilled,
            updateExpense.fulfilled, addTrainer.fulfilled, updateTrainer.fulfilled,
            deleteTrainer.fulfilled,
        ];

        refreshTriggers.forEach(action => {
            builder.addCase(action, (state) => {
                state.needsRefresh = true;
            });
        });
    },
});

export default dashboardSlice.reducer;
