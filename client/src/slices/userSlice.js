import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all users
export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:5000/api/settings');  // GET request to fetch users
            return response.data;  // Data returned from server
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);  // Error handling
        }
    }
);

// Register User
export const registerUser = createAsyncThunk(
    'user/register',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:5000/api/settings', { username, password });
            return response.data;  // Data returned from server
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);  // Error handling
        }
    }
);

// Update User
export const updateUser = createAsyncThunk(
    'user/update',
    async ({ userId, username, password }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/settings/${userId}`, { username, password });
            return response.data;  // Data returned from server
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);  // Error handling
        }
    }
);

// Slice definition
const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Users
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;  // Store users data
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Register User
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload);  // Add the new user to the list
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update User
        builder
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                // Replace the old user with the updated one
                const index = state.users.findIndex((user) => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
