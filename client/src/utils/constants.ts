// src/utils/constants.ts

// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = 'http://localhost:5000/api';

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD: '/',
  TRAINEES: '/trainees',
  TRAINERS: '/trainers',
  EXPENSES: '/expenses',
  USERS: '/users',
  SETTINGS: '/settings',
  MARKETING: '/marketing',
  COUPONS: '/coupons',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
};

export const TOAST_DURATION = 3000;

export const PAGINATION_LIMIT = 10;
