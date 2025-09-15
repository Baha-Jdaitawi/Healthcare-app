import { apiGet, apiPut } from './api.js';

// Get all patients (for doctors and admin)
export function getAllPatients(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  return apiGet(`/users/patients${queryString ? `?${queryString}` : ''}`);
}

// Get patient by ID (for doctors)
export function getPatientById(patientId) {
  return apiGet(`/users/patients/${patientId}`);
}

// Get current patient profile (for logged-in patient)
export function getPatientProfile() {
  return apiGet('/users/patient/profile');
}

// Update patient profile (for logged-in patient)
export function updatePatientProfile(profileData) {
  return apiPut('/users/patient/profile', profileData);
}

// Search patients (for doctors)
export function searchPatients(searchParams) {
  const queryParams = new URLSearchParams();
  
  if (searchParams.query) queryParams.append('q', searchParams.query);
  if (searchParams.page) queryParams.append('page', searchParams.page);
  if (searchParams.limit) queryParams.append('limit', searchParams.limit);
  
  return apiGet(`/users/search/patients?${queryParams.toString()}`);
}

// Get patient appointments (for logged-in patient)
export function getPatientAppointments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params.date) queryParams.append('date', params.date);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/appointments/patient${queryString ? `?${queryString}` : ''}`);
}

// Get patient's upcoming appointments
export function getPatientUpcomingAppointments(limit = 10) {
  return apiGet(`/appointments/patient/upcoming?limit=${limit}`);
}

// Get patient's past appointments
export function getPatientPastAppointments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  
  const queryString = queryParams.toString();
  return apiGet(`/appointments/patient/past${queryString ? `?${queryString}` : ''}`);
}

// Get patient's today appointments
export function getPatientTodayAppointments() {
  return apiGet('/appointments/patient/today');
}

// Get patient documents (for logged-in patient)
export function getPatientDocuments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.appointmentId) queryParams.append('appointmentId', params.appointmentId);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/patient${queryString ? `?${queryString}` : ''}`);
}

// Get patient reviews (reviews written by the patient)
export function getPatientReviews(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/patient${queryString ? `?${queryString}` : ''}`);
}

// Get patient dashboard data (for logged-in patient)
export function getPatientDashboard() {
  return apiGet('/users/patient/dashboard');
}

// Get patient statistics (for logged-in patient)
export function getPatientStats() {
  return apiGet('/users/patient/stats');
}

// For admin - get all patients
export function getAllPatientsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.verified) queryParams.append('verified', params.verified);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/users/admin/patients${queryString ? `?${queryString}` : ''}`);
}

// For admin - update patient status
export function updatePatientStatus(patientId, status) {
  return apiPut(`/users/admin/patients/${patientId}/status`, { status });
}

// For admin - verify/unverify patient
export function verifyPatient(patientId, verified = true) {
  return apiPut(`/users/admin/patients/${patientId}/verify`, { verified });
}