// src/utils/api.ts

import axios from 'axios';
import { API_BASE_URL } from './constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getTenantId = () => {
  const hostname = window.location.hostname; // مثلاً: gym1.myapp.com

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {

    return 'HMCV';
  }

  // 2. لو إحنا Live (Production)
  // بنقسم الرابط بالنقطة وناخد أول جزء
  const parts = hostname.split('.');

  // تأكد إن فيه subdomain فعلاً (مش myapp.com بس)
  if (parts.length > 2) {
    return parts[0]; // هيرجع "gym1" أو "goldsegym"
  }
  return "public"

};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantId = getTenantId();

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
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
