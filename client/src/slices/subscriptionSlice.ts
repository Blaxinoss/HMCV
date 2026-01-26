// src/slices/subscriptionSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TraineesState, Trainee, ApiResponse, TraineeWithPagination, TraineesApiResponse } from '../types';
import api from '../utils/api';

interface FetchTraineesArgs {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}


export const fetchTrainees = createAsyncThunk<
  TraineeWithPagination,
  { page: number, search?: string, status?: string, limit: number },
  { rejectValue: string }
>(
  'trainees/fetchTrainees',
  async ({ page, limit, search, status }: FetchTraineesArgs, { rejectWithValue }) => {
    try {
      const response = await api.get<TraineesApiResponse>('/trainees', {
        params: { page, search, status: status !== 'all' ? status : undefined, limit }
      });
      return {
        trainees: response.data.data || [], // لو مفيش داتا رجع أراي فاضي
        pagination: response.data.pagination // لازم ترجع عشان الـ UI
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trainees'
      );
    }
  }
);

export const addTrainee = createAsyncThunk<
  Trainee,
  Omit<Trainee, '_id' | 'createdAt' | 'updatedAt' | 'memberId' | 'paid' | 'discount' | 'remaining' | 'daysLeft'>,
  { rejectValue: string }
>(
  'trainees/addTrainee',
  async (trainee, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Trainee>>('/trainees', trainee);
      return response.data.data || (trainee as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add trainee'
      );
    }
  }
);

export const updateTrainee = createAsyncThunk<
  Trainee,
  { id: string; data: Partial<Trainee> },
  { rejectValue: string }
>(
  'trainees/updateTrainee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Trainee>>(`/trainees/${id}`, data);
      return response.data.data || (data as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update trainee'
      );
    }
  }
);

export const freezeTrainee = createAsyncThunk<
  Trainee,
  string,
  { rejectValue: string }
>(
  'trainees/freezeTrainee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Trainee>>(`/trainees/${id}/freeze`);
      return response.data.data || {} as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to freeze trainee'
      );
    }
  }
);

export const checkInTrainee = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  'trainees/checkInTrainee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trainees/check-in/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to check in trainee'
      );
    }
  }
);

export const deleteTrainee = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'trainees/deleteTrainee',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/trainees/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete trainee'
      );
    }
  }
);

export const renewTrainee = createAsyncThunk<
  Trainee,
  { id: string; data: any },
  { rejectValue: string }
>(
  'trainees/renew',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trainees/${id}/renew`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Renewal failed');
    }
  }
);

const initialState: TraineesState = {
  trainees: [],
  pagination: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'trainees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Trainees
    builder
      .addCase(fetchTrainees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainees.fulfilled, (state, action) => {
        state.loading = false;
        state.trainees = action.payload.trainees;
        state.pagination = action.payload.pagination
        state.error = null;
      })
      .addCase(fetchTrainees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch trainees';
      });

    // Add Trainee
    builder
      .addCase(addTrainee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTrainee.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.trainees.find(t => t._id === action.payload._id);

        if (!exists) {
          state.trainees.push(action.payload);
          // أو لو عايز الجديد يظهر في الأول:
          // state.trainees.unshift(action.payload); 
          if (state.pagination) {
            state.pagination.totalUsers += 1;
          }
        }
        state.error = null;
      })
      .addCase(addTrainee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add trainee';
      });

    // Update Trainee
    builder
      .addCase(updateTrainee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainees.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trainees[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTrainee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update trainee';
      });

    // Freeze Trainee
    builder
      .addCase(freezeTrainee.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(freezeTrainee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainees.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          console.log("Updated Trainee:", state.trainees[index]);

          state.trainees[index] = {
            ...state.trainees[index], // هات الاسم والتليفون وباقي الحاجات القديمة
            ...action.payload         // وفوقهم حط التحديثات الجديدة (حالة التجميد والتاريخ)
          };
        } else {
          console.error("Trainee not found in state!");
        }
        state.error = null;
      })
      .addCase(freezeTrainee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to freeze trainee';
      });

    // Check-in Trainee
    builder
      .addCase(checkInTrainee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInTrainee.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(checkInTrainee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to check in trainee';
      });

    // Delete Trainee
    builder
      .addCase(deleteTrainee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainee.fulfilled, (state, action) => {
        state.loading = false;
        state.trainees = state.trainees.filter(t => t._id !== action.payload);
        if (state.pagination) {
          state.pagination.totalUsers -= 1;
        }
        state.error = null;
      })
      .addCase(deleteTrainee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete trainee';
      });

    builder
      .addCase(renewTrainee.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(renewTrainee.fulfilled, (state, action) => {
        const index = state.trainees.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trainees[index] = action.payload;
        }
        state.loading = false;
      })

      .addCase(renewTrainee.rejected, (state, action) => {
        state.error = action.payload || "Failed to renew trainee";
        state.loading = false;
      })
  },


});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
