// src/slices/authSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthState, LoginPayload, RegisterPayload, AuthUser, ApiResponse } from '../types';
import api from '../utils/api';
import { clearAuthStorage, getAuthToken, setAuthToken, setStoredUser } from '../utils/auth';

export const restoreSession = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue('No stored session');
    }

    try {
      const response = await api.get<ApiResponse<AuthUser>>('/auth/me');
      if (!response.data.success || !response.data.user) {
        return rejectWithValue(response.data.message || 'Session verification failed');
      }

      const user: AuthUser = {
        ...response.data.user,
        token,
        isAuthenticated: true,
      };
      setStoredUser(response.data.user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Session verification failed');
    }
  }
);

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

      if (response.data.success && response.data.token && response.data.user) {
        setAuthToken(response.data.token);
        setStoredUser(response.data.user);
        return {
          ...response.data.user,
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

      if (response.data.success && response.data.token && response.data.user) {
        setAuthToken(response.data.token);
        setStoredUser(response.data.user);
        return {
          ...response.data.user,
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
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.error = null;
      clearAuthStorage();
    },
    clearError: (state) => {
      state.error = null;
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
        state.initialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
        state.initialized = true;
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
        state.initialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true;
        clearAuthStorage();
      })


  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
