// src/slices/userSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UsersState, User, ApiResponse } from '../types';
import api from '../utils/api';

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/settings');
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const updateUser = createAsyncThunk<
  User,
  { userId: string; username?: string; password?: string },
  { rejectValue: string }
>(
  'users/updateUser',
  async ({ userId, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/settings/${userId}`, data);
      return response.data.data || ({} as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/settings/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user';
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
