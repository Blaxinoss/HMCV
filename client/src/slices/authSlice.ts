// src/slices/authSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginPayload, RegisterPayload, AuthUser, ApiResponse } from '../types';
import api from '../utils/api';
import { clearAuthStorage, setAuthToken, setStoredUser } from '../utils/auth';

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginPayload,
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<AuthUser>>('/auth/login', {
        username,
        password,
      });

      if (response.data.success && response.data.token) {
        setAuthToken(response.data.token);
        setStoredUser(response.data.user);
        return {
          ...response.data.user!,
          token: response.data.token,
          isAuthenticated: true,
        };
      }

      return rejectWithValue(response.data.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<AuthUser>>('/auth/register', {
        username,
        password,
      });

      if (response.data.success && response.data.token) {
        setAuthToken(response.data.token);
        setStoredUser(response.data.user);
        return {
          ...response.data.user!,
          token: response.data.token,
          isAuthenticated: true,
        };
      }

      return rejectWithValue(response.data.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);


const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      })


  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
