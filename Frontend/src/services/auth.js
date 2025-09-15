// services/auth.js
import { apiPost, apiGet } from './api.js';

// Login user
export const loginUser = async (email, password) => {
  const response = await apiPost('/auth/login', {
    email,
    password
  });
  
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

// Register user
export const registerUser = async (userData) => {
  const response = await apiPost('/auth/register', userData);
  
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

// Logout user
export const logoutUser = async () => {
  await apiPost('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user profile
export const getCurrentUser = async () => {
  return await apiGet('/auth/profile');
};

// Refresh token
export const refreshToken = async () => {
  const response = await apiPost('/auth/refresh-token');
  
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get stored user data
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get stored token
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Clear stored auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Google OAuth login
export const googleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};

// Check authentication status
export const checkAuthStatus = async () => {
  return await apiGet('/auth/check');
};