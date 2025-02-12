import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;



export const fetchTrainee = createAsyncThunk('trainee/fetchTrainees', async (_, thunkAPI) => {
    try {

        const response = await axios.get(`${API_BASE_URL}/trainees`);
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to fetch trainees')
    }
})

export const deleteTrainee = createAsyncThunk('trainees/deleteTrainees', async (id, thunkAPI) => {
    try {
        // Instead of deleting, update the trainee with isDeleted: true
        await axios.put(`${API_BASE_URL}/trainees/${id}`, { deleteFlag: true });
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to mark trainee as deleted');
    }
});


export const freezeTrainee = createAsyncThunk('trainees/freezeTrainees', async (id, thunkAPI) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/trainees/${id}/freeze`)
        console.log(response.data); // Check if the response includes the updated subscriptionEndDate
        return response.data; // Make sure you return the correct data here

    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to freeze Trainee subscription', error)
    }
});


export const addTrainee = createAsyncThunk('trainee/addTrainee', async (traineeData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/trainees`, traineeData)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(`Failed to add trainee ${error.message}`, error.message);

    }
})

export const updateTrainee = createAsyncThunk(
    'trainees/updateTrainee',
    async ({ id, updatedData }, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/trainees/${id}`, updatedData);
            return response.data; // Updated trainee object
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to update trainee');
        }
    }
);


const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState: {
        subList: [],
        status: 'idle',
        error: null,

    },
    reducers: {},
    extraReducers: (builder) => {
        builder.
            addCase(fetchTrainee.pending, (state) => {
                state.status = 'loading'
            })

            .addCase(fetchTrainee.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.subList = action.payload
            })

            .addCase(fetchTrainee.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })

            .addCase(deleteTrainee.fulfilled, (state, action) => {
                state.subList = [...state.subList.filter((sub) => sub._id !== action.payload)];
            })

            .addCase(deleteTrainee.rejected, (state, action) => {
                state.error = action.payload; // Capture delete error
            })

            .addCase(addTrainee.fulfilled, (state, action) => {
                state.subList.push(action.payload); // Add new trainee to the list
            })
            .addCase(addTrainee.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateTrainee.fulfilled, (state, action) => {
                const index = state.subList.findIndex((trainee) => trainee._id === action.payload._id);
                if (index !== -1) {
                    state.subList[index] = action.payload; // Update trainee in the list
                }
            })
            .addCase(updateTrainee.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(freezeTrainee.fulfilled, (state, action) => {
                const index = state.subList.findIndex((trainee) => trainee._id === action.payload._id);

                if (index !== -1) {
                    // Directly update the trainee's accountFreezeStatus with the payload
                    state.subList[index].accountFreezeStatus = action.payload.accountFreezeStatus;
                    state.subList[index].subscriptionEndDate = action.payload.subscriptionEndDate; // Also update subscriptionEndDate
                } else {
                    console.error('Trainee not found in subList');
                }
            })

            .addCase(freezeTrainee.rejected, (state, action) => {
                state.error = action.payload;
            })

    }
})

export default subscriptionSlice.reducer


