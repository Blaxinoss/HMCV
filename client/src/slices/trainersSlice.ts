// src/slices/trainersSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TrainersState, Trainer, ApiResponse } from '../types';
import api from '../utils/api';

export const fetchTrainers = createAsyncThunk<
  Trainer[],
  void,
  { rejectValue: string }
>(
  'trainers/fetchTrainers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Trainer[]>>('/trainers');
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trainers'
      );
    }
  }
);

export const addTrainer = createAsyncThunk<
  Trainer,
  Omit<Trainer, '_id' | 'createdAt' | 'updatedAt' | 'salaryAfterDiscount'>,
  { rejectValue: string }
>(
  'trainers/addTrainer',
  async (trainer, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Trainer>>('/trainers', trainer);
      return response.data.data || (trainer as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add trainer'
      );
    }
  }
);

export const updateTrainer = createAsyncThunk<
  Trainer,
  { id: string; data: Partial<Trainer> },
  { rejectValue: string }
>(
  'trainers/updateTrainer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Trainer>>(`/trainers/${id}`, data);
      return response.data.data || (data as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update trainer'
      );
    }
  }
);

export const deleteTrainer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'trainers/deleteTrainer',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/trainers/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete trainer'
      );
    }
  }
);

const initialState: TrainersState = {
  trainers: [],
  loading: false,
  error: null,
};

const trainersSlice = createSlice({
  name: 'trainers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Trainers
    builder
      .addCase(fetchTrainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainers.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers = action.payload;
        state.error = null;
      })
      .addCase(fetchTrainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch trainers';
      });

    // Add Trainer
    builder
      .addCase(addTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers.push(action.payload);
        state.error = null;
      })
      .addCase(addTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add trainer';
      });

    // Update Trainer
    builder
      .addCase(updateTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainers.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trainers[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update trainer';
      });

    // Delete Trainer
    builder
      .addCase(deleteTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers = state.trainers.filter(t => t._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete trainer';
      });
  },
});

export const { clearError } = trainersSlice.actions;
export default trainersSlice.reducer;
