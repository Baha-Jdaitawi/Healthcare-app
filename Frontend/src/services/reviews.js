import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

// Create a new review
export function createReview(reviewData) {
  return apiPost('/reviews', reviewData);
}

// Get reviews for a doctor
export function getDoctorReviews(doctorId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.rating) queryParams.append('rating', params.rating);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.verified) queryParams.append('verified', params.verified);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/doctor/${doctorId}${queryString ? `?${queryString}` : ''}`);
}

// Get reviews by a patient
export function getPatientReviews(patientId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/patient/${patientId}${queryString ? `?${queryString}` : ''}`);
}

// Get current user's reviews (patient's own reviews)
export function getMyReviews(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/my${queryString ? `?${queryString}` : ''}`);
}

// Get a specific review by ID
export function getReviewById(reviewId) {
  return apiGet(`/reviews/${reviewId}`);
}

// Update a review (patient can edit their own review)
export function updateReview(reviewId, reviewData) {
  return apiPut(`/reviews/${reviewId}`, reviewData);
}

// Delete a review
export function deleteReview(reviewId) {
  return apiDelete(`/reviews/${reviewId}`);
}

// Doctor responds to a review
export function respondToReview(reviewId, responseData) {
  return apiPost(`/reviews/${reviewId}/respond`, responseData);
}

// Update doctor's response to a review
export function updateReviewResponse(reviewId, responseData) {
  return apiPut(`/reviews/${reviewId}/respond`, responseData);
}

// Delete doctor's response to a review
export function deleteReviewResponse(reviewId) {
  return apiDelete(`/reviews/${reviewId}/respond`);
}

// Get doctor's review statistics
export function getDoctorReviewStats(doctorId) {
  return apiGet(`/reviews/doctor/${doctorId}/stats`);
}

// Get recent reviews for a doctor
export function getRecentDoctorReviews(doctorId, limit = 5) {
  return apiGet(`/reviews/doctor/${doctorId}/recent?limit=${limit}`);
}

// Get top-rated doctors
export function getTopRatedDoctors(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.specialization) queryParams.append('specialization', params.specialization);
  if (params.location) queryParams.append('location', params.location);
  if (params.minReviews) queryParams.append('minReviews', params.minReviews);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/top-rated${queryString ? `?${queryString}` : ''}`);
}

// Search reviews
export function searchReviews(searchParams) {
  const queryParams = new URLSearchParams();
  
  if (searchParams.query) queryParams.append('q', searchParams.query);
  if (searchParams.doctorId) queryParams.append('doctorId', searchParams.doctorId);
  if (searchParams.rating) queryParams.append('rating', searchParams.rating);
  if (searchParams.verified) queryParams.append('verified', searchParams.verified);
  if (searchParams.page) queryParams.append('page', searchParams.page);
  if (searchParams.limit) queryParams.append('limit', searchParams.limit);
  
  return apiGet(`/reviews/search?${queryParams.toString()}`);
}

// Report a review (for inappropriate content)
export function reportReview(reviewId, reportData) {
  return apiPost(`/reviews/${reviewId}/report`, reportData);
}

// Mark review as helpful/unhelpful
export function markReviewHelpful(reviewId, helpful = true) {
  return apiPost(`/reviews/${reviewId}/helpful`, { helpful });
}

// For admin - get all reviews
export function getAllReviewsAdmin(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params.patientId) queryParams.append('patientId', params.patientId);
  if (params.rating) queryParams.append('rating', params.rating);
  if (params.status) queryParams.append('status', params.status);
  if (params.reported) queryParams.append('reported', params.reported);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  return apiGet(`/reviews/admin${queryString ? `?${queryString}` : ''}`);
}

// For admin - update review status
export function updateReviewStatus(reviewId, status) {
  return apiPut(`/reviews/admin/${reviewId}/status`, { status });
}

// For admin - verify/unverify review
export function verifyReview(reviewId, verified = true) {
  return apiPut(`/reviews/admin/${reviewId}/verify`, { verified });
}

// Get review statistics
export function getReviewStats() {
  return apiGet('/reviews/stats');
}