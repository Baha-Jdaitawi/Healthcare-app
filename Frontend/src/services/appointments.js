// services/appointments.js
import { apiGet, apiPost, apiPut } from './api.js';

// Book new appointment
export const bookAppointment = async (appointmentData) => {
  return await apiPost('/appointments', appointmentData);
};

// Get specific appointment
export const getAppointment = async (appointmentId) => {
  return await apiGet(`/appointments/${appointmentId}`);
};

// Get current user's appointments
export const getMyAppointments = async () => {
  return await apiGet('/appointments');
};

// Get upcoming appointments
export const getUpcomingAppointments = async () => {
  return await apiGet('/appointments/upcoming/list');
};

// Get past appointments
export const getPastAppointments = async () => {
  return await apiGet('/appointments/past/list');
};

// Get today's appointments (for doctors)
export const getTodayAppointments = async () => {
  return await apiGet('/appointments/today/list');
};

// Get appointments for a specific patient (doctors/admin only)
export const getPatientAppointments = async (patientId) => {
  return await apiGet(`/appointments/patient/${patientId}`);
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  return await apiPut(`/appointments/${appointmentId}/status`, { status });
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, reason) => {
  return await apiPut(`/appointments/${appointmentId}/cancel`, { reason });
};

// Reschedule appointment
export const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
  return await apiPut(`/appointments/${appointmentId}/reschedule`, {
    newDate,
    newTime
  });
};

// Add consultation notes (doctors only)
export const addConsultationNotes = async (appointmentId, notes) => {
  return await apiPut(`/appointments/${appointmentId}/notes`, { notes });
};

// Get available time slots for a doctor
export const getDoctorAvailableSlots = async (doctorId, date) => {
  return await apiGet(`/doctors/${doctorId}/available-slots?date=${date}`);
};