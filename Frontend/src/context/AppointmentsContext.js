import { createContext, useContext, useState, useCallback } from 'react';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getUpcomingAppointments,
  getTodayAppointments,
  getDoctorAvailability,
  getDoctorTimeSlots
} from '../services/appointments.js';

const AppointmentsContext = createContext();

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
}

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all appointments with filters
  const fetchAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAppointments(filters);
      setAppointments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch appointments');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch patient appointments
  const fetchPatientAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPatientAppointments(filters);
      setAppointments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch patient appointments');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch doctor appointments
  const fetchDoctorAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorAppointments(filters);
      setAppointments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch doctor appointments');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch upcoming appointments
  const fetchUpcomingAppointments = useCallback(async (limit = 10) => {
    try {
      setError(null);
      const response = await getUpcomingAppointments(limit);
      setUpcomingAppointments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch upcoming appointments');
      throw error;
    }
  }, []);

  // Fetch today's appointments
  const fetchTodayAppointments = useCallback(async () => {
    try {
      setError(null);
      const response = await getTodayAppointments();
      setTodayAppointments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch today\'s appointments');
      throw error;
    }
  }, []);

  // Get single appointment
  const fetchAppointmentById = useCallback(async (appointmentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAppointmentById(appointmentId);
      setCurrentAppointment(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch appointment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Book new appointment
  const bookAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createAppointment(appointmentData);
      
      // Add to appointments list
      setAppointments(prev => [response.data || response, ...prev]);
      
      // Refresh upcoming appointments
      await fetchUpcomingAppointments();
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to book appointment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUpcomingAppointments]);

  // Update appointment
  const updateAppointmentData = useCallback(async (appointmentId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateAppointment(appointmentId, updateData);
      
      // Update in appointments list
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, ...response.data } : apt)
      );
      
      // Update current appointment if same
      if (currentAppointment?.id === appointmentId) {
        setCurrentAppointment(prev => ({ ...prev, ...response.data }));
      }
      
      // Refresh related lists
      await fetchUpcomingAppointments();
      await fetchTodayAppointments();
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update appointment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentAppointment, fetchUpcomingAppointments, fetchTodayAppointments]);

  // Cancel appointment
  const cancelAppointmentData = useCallback(async (appointmentId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelAppointment(appointmentId, reason);
      
      // Update in appointments list
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled', cancellationReason: reason }
            : apt
        )
      );
      
      // Update current appointment if identical
      if (currentAppointment?.id === appointmentId) {
        setCurrentAppointment(prev => ({ 
          ...prev, 
          status: 'cancelled', 
          cancellationReason: reason 
        }));
      }
      
      // Refresh related lists
      await fetchUpcomingAppointments();
      await fetchTodayAppointments();
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to cancel appointment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentAppointment, fetchUpcomingAppointments, fetchTodayAppointments]);

  // Get doctor availability
  const fetchDoctorAvailability = useCallback(async (doctorId, params = {}) => {
    try {
      setError(null);
      const response = await getDoctorAvailability(doctorId, params);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch doctor availability');
      throw error;
    }
  }, []);

  // Get doctor time slots
  const fetchDoctorTimeSlots = useCallback(async (doctorId, date, duration = 30) => {
    try {
      setError(null);
      const response = await getDoctorTimeSlots(doctorId, date, duration);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch time slots');
      throw error;
    }
  }, []);

  // Clear current appointment
  const clearCurrentAppointment = useCallback(() => {
    setCurrentAppointment(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetAppointments = useCallback(() => {
    setAppointments([]);
    setCurrentAppointment(null);
    setUpcomingAppointments([]);
    setTodayAppointments([]);
    setError(null);
  }, []);

  const value = {
    // State
    appointments,
    currentAppointment,
    upcomingAppointments,
    todayAppointments,
    loading,
    error,

    // Actions
    fetchAppointments,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    fetchUpcomingAppointments,
    fetchTodayAppointments,
    fetchAppointmentById,
    bookAppointment,
    updateAppointmentData,
    cancelAppointmentData,
    fetchDoctorAvailability,
    fetchDoctorTimeSlots,

    // Utilities
    clearCurrentAppointment,
    clearError,
    resetAppointments
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}