import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;



// Async Thunks
export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
    const response = await axios.get(`http://localhost:5000/api/expenses`);
    return response.data;
});

export const addExpense = createAsyncThunk('expenses/addExpense', async (expense) => {
    const response = await axios.post(`http://localhost:5000/api/expenses`, expense);
    return response.data;
});

export const editExpense = createAsyncThunk('expenses/editExpense', async ({ id, updatedExpense }) => {
    const response = await axios.post(`http://localhost:5000/api/expenses/%{id}`, updatedExpense);
    return response.data;
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (id) => {
    await axios.delete(`http://localhost:5000/api/expenses/%{id}`);
    return id;
});

// Slice
const expenseSlice = createSlice({
    name: 'expenses',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(editExpense.fulfilled, (state, action) => {
                const index = state.items.findIndex((expense) => expense._id === action.payload._id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.items = state.items.filter((expense) => expense._id !== action.payload);
            });
    },
});

export default expenseSlice.reducer;
