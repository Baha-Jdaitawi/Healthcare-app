import { apiGet, apiPut } from './api.js';

// Get all doctors with filters
export function getAllDoctors(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.specialization) queryParams.append('specialization', params.specialization);
  if (params.location) queryParams.append('location', params.location);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.minRating) queryParams.append('minRating', params.minRating);
  if (params.maxRating) queryParams.append('maxRating', params.maxRating);
  if (params.availableFrom) queryParams.append('availableFrom', params.availableFrom);
  if (params.availableTo) queryParams.append('availableTo', params.availableTo);
  if (params.yearsOfExperience) queryParams.append('yearsOfExperience', params.yearsOfExperience);
  
  const queryString = queryParams.toString();
  return apiGet(`/users/doctors${queryString ? `?${queryString}` : ''}`);
}

// Get doctor by ID
export function getDoctorById(doctorId) {
  return apiGet(`/users/doctors/${doctorId}`);
}

// Get current doctor profile (for logged-in doctors)
export function getDoctorProfile() {
  return apiGet('/users/doctor/profile');
}

// Update doctor profile (for logged-in doctors)
export function updateDoctorProfile(profileData) {
  return apiPut('/users/doctor/profile', profileData);
}

// Search doctors
export function searchDoctors(searchParams) {
  const queryParams = new URLSearchParams();
  
  if (searchParams.query) queryParams.append('q', searchParams.query);
  if (searchParams.specialization) queryParams.append('specialization', searchParams.specialization);
  if (searchParams.location) queryParams.append('location', searchParams.location);
  if (searchParams.page) queryParams.append('page', searchParams.page);
  if (searchParams.limit) queryParams.append('limit', searchParams.limit);
  
  return apiGet(`/users/search/doctors?${queryParams.toString()}`);
}

// Get doctor reviews
export function getDoctorReviews(doctorId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.rating) queryParams.append('rating', params.rating);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/doctor/${doctorId}${queryString ? `?${queryString}` : ''}`);
}

// Get doctor statistics/summary
export function getDoctorStats(doctorId) {
  return apiGet(`/users/doctors/${doctorId}/stats`);
}

// Get doctor availability/schedule
export function getDoctorAvailability(doctorId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.date) queryParams.append('date', params.date);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.duration) queryParams.append('duration', params.duration);
  
  const queryString = queryParams.toString();
  return apiGet(`/appointments/doctors/${doctorId}/availability${queryString ? `?${queryString}` : ''}`);
}

// Get available time slots for a doctor on a specific date
export function getDoctorTimeSlots(doctorId, date, duration = 30) {
  return apiGet(`/appointments/doctors/${doctorId}/slots?date=${date}&duration=${duration}`);
}

// Get doctor's appointments (for logged-in doctors)
export function getDoctorAppointments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.date) queryParams.append('date', params.date);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/appointments/doctor${queryString ? `?${queryString}` : ''}`);
}

// Get today's appointments for doctor
export function getDoctorTodayAppointments() {
  return apiGet('/appointments/doctor/today');
}

// Get upcoming appointments for doctor
export function getDoctorUpcomingAppointments(limit = 10) {
  return apiGet(`/appointments/doctor/upcoming?limit=${limit}`);
}

// Get doctor's documents
export function getDoctorDocuments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/doctor${queryString ? `?${queryString}` : ''}`);
}

// Get doctor's messages
export function getDoctorMessages(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.conversationWith) queryParams.append('conversationWith', params.conversationWith);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly);
  
  const queryString = queryParams.toString();
  return apiGet(`/messages/doctor${queryString ? `?${queryString}` : ''}`);
}

// Get doctor specializations
export function getDoctorSpecializations() {
  return apiGet('/specializations');
}

// Get specialization by ID
export function getSpecializationById(specializationId) {
  return apiGet(`/specializations/${specializationId}`);
}

// Search specializations
export function searchSpecializations(query) {
  return apiGet(`/specializations/search?q=${encodeURIComponent(query)}`);
}

// Get doctors by specialization
export function getDoctorsBySpecialization(specializationId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.location) queryParams.append('location', params.location);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/specializations/${specializationId}/doctors${queryString ? `?${queryString}` : ''}`);
}

// For admin users - get all doctors for management
export function getAllDoctorsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.verified) queryParams.append('verified', params.verified);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/users/admin/doctors${queryString ? `?${queryString}` : ''}`);
}

// For admin - verify/unverify doctor
export function verifyDoctor(doctorId, verified = true) {
  return apiPut(`/users/admin/doctors/${doctorId}/verify`, { verified });
}

// For admin - activate/deactivate doctor
export function updateDoctorStatus(doctorId, status) {
  return apiPut(`/users/admin/doctors/${doctorId}/status`, { status });
}

// Get doctor dashboard statistics (for logged-in doctors)
export function getDoctorDashboard() {
  return apiGet('/users/doctor/dashboard');
}