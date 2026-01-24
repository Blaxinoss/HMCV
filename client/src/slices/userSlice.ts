// src/slices/userSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UsersState, User, ApiResponse, RegisterPayload } from '../types';
import api from '../utils/api';

// 1. Fetch Users
// ملحوظة: تأكد إنك عملت الروت ده في الباك إند (غالباً هيكون في auth.ts أو settings.ts)
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      // تأكد من المسار ده في الباك إند
      // لو الروت موجود في auth.ts يبقى المسار غالباً /auth/users أو /auth/settings
      const response = await api.get<ApiResponse<User[]>>('/settings/');
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

// 2. Update User
export const updateUser = createAsyncThunk<
  User,
  { userId: string; username?: string; password?: string },
  { rejectValue: string }
>(
  'users/updateUser',
  async ({ userId, ...data }, { rejectWithValue }) => {
    try {
      // ⚠️ تصحيح المسار:
      // بما إنك حطيت الـ PUT route جوه auth.ts، يبقى المسار /auth/${userId}
      // إلا لو أنت عامل mount للراوتر ده على /settings في index.ts
      const response = await api.put<ApiResponse<User>>(`/auth/${userId}`, data);
      return response.data.data || ({} as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

// 3. Delete User
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      // المسار ده سليم بناءً على كود الباك إند بتاعك
      await api.delete(`/auth/deleteUser/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);



export const createAdmin = createAsyncThunk<
  User,
  RegisterPayload,
  { rejectValue: string }
>(
  'auth/createAdmin',
  async ({ username, password }, { rejectWithValue }) => {
    try {

      const response = await api.post('/auth/create-admin', {
        username,
        password,
      });

      return response.data.data;

    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create admin'
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

        // ⚠️ تصحيح هام جداً:
        // MongoDB بيرجع _id مش id
        const index = state.users.findIndex(u => u._id === action.payload._id);

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

        // ⚠️ تصحيح هام جداً:
        // المقارنة لازم تكون مع _id
        state.users = state.users.filter(u => u._id !== action.payload);

        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      })

    builder
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload)


      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;