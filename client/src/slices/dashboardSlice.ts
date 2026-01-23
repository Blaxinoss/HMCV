// src/slices/dashboardSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';
import { DashboardData, DashboardState, ApiResponse } from '../types';

export const fetchDashboardStats = createAsyncThunk<
    DashboardData,
    void,
    { rejectValue: string }
>(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<ApiResponse<DashboardData>>('/dashboard/stats');
            return response.data.data!;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null,
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
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;