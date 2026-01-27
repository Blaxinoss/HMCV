// src/utils/api.ts

import axios from 'axios';
import { API_BASE_URL } from './constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. هات عنوان الصفحة الحالي والرابط اللي بنطلبه
    const isLoginPage = window.location.pathname.includes('/login');
    const isLoginRequest = error.config.url.includes('/auth/login');
    const isLoginRequest2 = error.config.url.includes('/');

    // 2. لو الخطأ 401، بس إحنا مش في عملية تسجيل دخول
    if (error.response && error.response.status === 401 && !isLoginRequest && !isLoginRequest2) {
      // هنا بس اعمل طرد للمستخدم
      localStorage.clear();
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);


export default api;
