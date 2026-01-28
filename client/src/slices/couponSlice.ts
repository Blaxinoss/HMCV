// src/slices/couponsSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';
// Assuming you have these types defined in '../types', otherwise defined below
import { ApiResponse } from '../types';

// --- Types Definition (If not in types file) ---
export interface ICoupon {
    _id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    value: number;
    expiryDate: string;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt?: string;
}

export interface CouponsState {
    coupons: ICoupon[];
    loading: boolean;
    validating: boolean; // Special state for the "Check" button
    error: string | null;
}
// -----------------------------------------------

const initialState: CouponsState = {
    coupons: [],
    loading: false,
    validating: false,
    error: null,
};

// 1. Fetch All Coupons
export const fetchCoupons = createAsyncThunk<
    ICoupon[],
    void,
    { rejectValue: string }
>(
    'coupons/fetchCoupons',
    async (_, { rejectWithValue }) => {
        try {
            // Using api util instead of direct axios
            const response = await api.get<ApiResponse<ICoupon[]>>('/coupons');
            return response.data.data || [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch coupons'
            );
        }
    }
);

// 2. Add New Coupon
export const addCoupon = createAsyncThunk<
    ICoupon,
    Partial<ICoupon>, // Accepting Partial data for creation
    { rejectValue: string }
>(
    'coupons/addCoupon',
    async (couponData, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse<ICoupon>>('/coupons', couponData);
            return response.data.data || (couponData as ICoupon);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add coupon'
            );
        }
    }
);

// 3. Delete Coupon
export const deleteCoupon = createAsyncThunk<
    string, // Returns the ID
    string, // Accepts the ID
    { rejectValue: string }
>(
    'coupons/deleteCoupon',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/coupons/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete coupon'
            );
        }
    }
);

// 4. Validate Coupon (For Subscription Form)
export const validateCoupon = createAsyncThunk<
    ICoupon, // Returns the full coupon data if valid
    string,  // Accepts the code string
    { rejectValue: string }
>(
    'coupons/validate',
    async (code, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse<ICoupon>>('/coupons/validate-coupon', { code });
            if (!response.data.data) {
                return rejectWithValue('Invalid Coupon');
            }
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Invalid Coupon'
            );
        }
    }
);

const couponsSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // --- Fetch Coupons ---
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
                state.error = null;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch coupons';
            });

        // --- Add Coupon ---
        builder
            .addCase(addCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCoupon.fulfilled, (state, action) => {
                state.loading = false;
                // Add to the beginning of the list (unshift) or end (push)
                state.coupons.unshift(action.payload);
                state.error = null;
            })
            .addCase(addCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to add coupon';
            });

        // --- Delete Coupon ---
        builder
            .addCase(deleteCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = state.coupons.filter((c) => c._id !== action.payload);
                state.error = null;
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete coupon';
            });

        // --- Validate Coupon (Specific Logic) ---
        builder
            .addCase(validateCoupon.pending, (state) => {
                state.validating = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state) => {
                state.validating = false;
                // Note: We don't add validated coupons to the list, 
                // as this action is just for checking in the form
                state.error = null;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.validating = false;
                // We don't set global error here to avoid blocking the UI, 
                // the component handles the error via .unwrap() usually, 
                // but we set it here just in case.
                state.error = 'Invalid Coupon';
            });
    },
});

export const { clearError } = couponsSlice.actions;
export default couponsSlice.reducer;