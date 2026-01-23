// src/slices/expensesSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ExpensesState, Expense, ApiResponse } from '../types';
import api from '../utils/api';

export const fetchExpenses = createAsyncThunk<
  Expense[],
  void,
  { rejectValue: string }
>(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Expense[]>>('/expenses');
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenses'
      );
    }
  }
);

export const addExpense = createAsyncThunk<
  Expense,
  Omit<Expense, '_id' | 'createdAt'>,
  { rejectValue: string }
>(
  'expenses/addExpense',
  async (expense, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Expense>>('/expenses', expense);
      return response.data.data || expense as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; data: Partial<Expense> },
  { rejectValue: string }
>(
  'expenses/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
      return response.data.data || (data as any);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update expense'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete expense'
      );
    }
  }
);

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch expenses';
      });

    // Add Expense
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
        state.error = null;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add expense';
      });

    // Update Expense
    builder
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update expense';
      });

    // Delete Expense
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete expense';
      });
  },
});

export const { clearError } = expensesSlice.actions;
export default expensesSlice.reducer;
