// src/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expensesSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import trainerReducer from './slices/trainersSlice';
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trainees: subscriptionReducer,
    expenses: expenseReducer,
    trainers: trainerReducer,
    user: userReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
