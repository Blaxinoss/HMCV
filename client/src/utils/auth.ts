// src/utils/auth.ts

import { STORAGE_KEYS } from './constants';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getStoredUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearAuthStorage = (): void => {
  removeAuthToken();
  localStorage.removeItem(STORAGE_KEYS.USER);
};
