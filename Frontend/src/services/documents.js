import { apiGet, apiPost, apiPut, apiDelete, apiUpload, apiDownload } from './api.js';

// Upload document
export function uploadDocument(formData) {
  return apiUpload('/documents/upload', formData);
}

// Get user documents (patient || doctor)
export function getUserDocuments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents${queryString ? `?${queryString}` : ''}`);
}

// Get document by ID
export function getDocumentById(documentId) {
  return apiGet(`/documents/${documentId}`);
}

// Update document details
export function updateDocument(documentId, documentData) {
  return apiPut(`/documents/${documentId}`, documentData);
}

// Delete document
export function deleteDocument(documentId) {
  return apiDelete(`/documents/${documentId}`);
}

// Download document
export function downloadDocument(documentId, filename) {
  return apiDownload(`/documents/${documentId}/download`, filename);
}

// Get patient documents (for doctors)
export function getPatientDocuments(patientId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.appointmentId) queryParams.append('appointmentId', params.appointmentId);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/patient/${patientId}${queryString ? `?${queryString}` : ''}`);
}

// Get doctor documents (for patients)
export function getDoctorDocuments(doctorId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/doctor/${doctorId}${queryString ? `?${queryString}` : ''}`);
}

// Get documents by appointment
export function getAppointmentDocuments(appointmentId) {
  return apiGet(`/documents/appointment/${appointmentId}`);
}

// Share document with user
export function shareDocument(documentId, shareData) {
  return apiPost(`/documents/${documentId}/share`, shareData);
}

// Get shared documents
export function getSharedDocuments(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.sharedBy) queryParams.append('sharedBy', params.sharedBy);
  if (params.sharedWith) queryParams.append('sharedWith', params.sharedWith);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/shared${queryString ? `?${queryString}` : ''}`);
}

// Get document sharing permissions
export function getDocumentPermissions(documentId) {
  return apiGet(`/documents/${documentId}/permissions`);
}

// Update document sharing permissions
export function updateDocumentPermissions(documentId, permissions) {
  return apiPut(`/documents/${documentId}/permissions`, permissions);
}

// Get document categories
export function getDocumentCategories() {
  return apiGet('/documents/categories');
}

// Get document types
export function getDocumentTypes() {
  return apiGet('/documents/types');
}

// Search documents
export function searchDocuments(searchParams) {
  const queryParams = new URLSearchParams();
  
  if (searchParams.query) queryParams.append('q', searchParams.query);
  if (searchParams.type) queryParams.append('type', searchParams.type);
  if (searchParams.category) queryParams.append('category', searchParams.category);
  if (searchParams.dateFrom) queryParams.append('dateFrom', searchParams.dateFrom);
  if (searchParams.dateTo) queryParams.append('dateTo', searchParams.dateTo);
  if (searchParams.page) queryParams.append('page', searchParams.page);
  if (searchParams.limit) queryParams.append('limit', searchParams.limit);
  
  return apiGet(`/documents/search?${queryParams.toString()}`);
}

// Get recent documents
export function getRecentDocuments(limit = 10) {
  return apiGet(`/documents/recent?limit=${limit}`);
}

// For admin - get all documents
export function getAllDocumentsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.type) queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  return apiGet(`/documents/admin${queryString ? `?${queryString}` : ''}`);
}

// For admin - update document status
export function updateDocumentStatus(documentId, status) {
  return apiPut(`/documents/admin/${documentId}/status`, { status });
}

// Get document statistics
export function getDocumentStats() {
  return apiGet('/documents/stats');
}