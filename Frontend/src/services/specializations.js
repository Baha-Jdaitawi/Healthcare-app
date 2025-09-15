import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

// Get all specializations
export function getAllSpecializations(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.active) queryParams.append('active', params.active);
  
  const queryString = queryParams.toString();
  return apiGet(`/specializations${queryString ? `?${queryString}` : ''}`);
}

// Get specialization by ID
export function getSpecializationById(specializationId) {
  return apiGet(`/specializations/${specializationId}`);
}

// Search specializations
export function searchSpecializations(query, params = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.active) queryParams.append('active', params.active);
  
  return apiGet(`/specializations/search?${queryParams.toString()}`);
}

// Get doctors by specialization
export function getDoctorsBySpecialization(specializationId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.location) queryParams.append('location', params.location);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.minRating) queryParams.append('minRating', params.minRating);
  if (params.availableFrom) queryParams.append('availableFrom', params.availableFrom);
  if (params.availableTo) queryParams.append('availableTo', params.availableTo);
  
  const queryString = queryParams.toString();
  return apiGet(`/specializations/${specializationId}/doctors${queryString ? `?${queryString}` : ''}`);
}

// Get specialization statistics
export function getSpecializationStats(specializationId) {
  return apiGet(`/specializations/${specializationId}/stats`);
}

// Get popular/trending specializations
export function getPopularSpecializations(limit = 10) {
  return apiGet(`/specializations/popular?limit=${limit}`);
}

// Get specializations with doctor counts
export function getSpecializationsWithCounts() {
  return apiGet('/specializations/with-counts');
}

// For admin - create new specialization
export function createSpecialization(specializationData) {
  return apiPost('/specializations', specializationData);
}

// For admin - update specialization
export function updateSpecialization(specializationId, specializationData) {
  return apiPut(`/specializations/${specializationId}`, specializationData);
}

// For admin - delete specialization
export function deleteSpecialization(specializationId) {
  return apiDelete(`/specializations/${specializationId}`);
}

// For admin - get all specializations with admin details
export function getAllSpecializationsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  return apiGet(`/specializations/admin${queryString ? `?${queryString}` : ''}`);
}

// For admin - update specialization status
export function updateSpecializationStatus(specializationId, status) {
  return apiPut(`/specializations/admin/${specializationId}/status`, { status });
}

// For admin - get specialization management stats
export function getSpecializationAdminStats() {
  return apiGet('/specializations/admin/stats');
}