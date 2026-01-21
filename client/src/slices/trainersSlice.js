import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';



export const fetchTrainer = createAsyncThunk('trainer/fetchTrainers', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/trainers`)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to fetch trainers')
    }
})

export const deleteTrainer = createAsyncThunk('trainers/deleteTrainers', async (id, thunkAPI) => {
    try {
        // Instead of deleting, update the trainer with isDeleted: true
        await axios.put(`http://localhost:5000/api/trainers/${id}`, { deleteFlag: true });
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to mark trainer as deleted');
    }
});



export const addTrainer = createAsyncThunk('trainer/addTrainer', async (trainerData, thunkAPI) => {
    try {
        const response = await axios.post('http://localhost:5000/api/trainers', trainerData)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(`Failed to add trainer ${error.message}`, error.message);

    }
})

export const updateTrainer = createAsyncThunk(
    'trainers/updateTrainer',
    async ({ id, updatedData }, thunkAPI) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/trainers/${id}`, updatedData);
            return response.data; // Updated trainer object
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to update trainer');
        }
    }
);


const trainerSlice = createSlice({
    name: 'trainer',
    initialState: {
        trainerList: [],
        status: 'idle',
        error: null,

    },
    reducers: {},
    extraReducers: (builder) => {
        builder.
            addCase(fetchTrainer.pending, (state) => {
                state.status = 'loading'
            })

            .addCase(fetchTrainer.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.trainerList = action.payload
            })

            .addCase(fetchTrainer.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })

            .addCase(deleteTrainer.fulfilled, (state, action) => {
                state.trainerList = [...state.trainerList.filter((sub) => sub._id !== action.payload)];
            })

            .addCase(deleteTrainer.rejected, (state, action) => {
                state.error = action.payload; // Capture delete error
            })

            .addCase(addTrainer.fulfilled, (state, action) => {
                state.trainerList.push(action.payload); // Add new trainer to the list
            })
            .addCase(addTrainer.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateTrainer.fulfilled, (state, action) => {
                const index = state.trainerList.findIndex((trainer) => trainer._id === action.payload._id);
                if (index !== -1) {
                    state.trainerList[index] = action.payload; // Update trainer in the list
                }
            })
            .addCase(updateTrainer.rejected, (state, action) => {
                state.error = action.payload;
            })



    }
})

export default trainerSlice.reducer


