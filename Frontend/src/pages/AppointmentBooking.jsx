import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useAppointments } from '../context/GlobalContext.js';
import { getAllDoctors, getDoctorById, getDoctorTimeSlots } from '../services/doctors.js';
import { getAllSpecializations } from '../services/specializations.js';

function AppointmentBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { bookAppointment, loading: bookingLoading } = useAppointments();

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [appointmentData, setAppointmentData] = useState({
    doctorId: searchParams.get('doctorId') || '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    reason: '',
    notes: ''
  });

  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    search: ''
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load specializations for filter
        const specializationsResponse = await getAllSpecializations();
        setSpecializations(specializationsResponse.data || specializationsResponse || []);

        
        if (appointmentData.doctorId) {
          const doctorResponse = await getDoctorById(appointmentData.doctorId);
          setSelectedDoctor(doctorResponse.data || doctorResponse);
          setStep(2);
        } else {
          
          const doctorsResponse = await getAllDoctors();
          setDoctors(doctorsResponse.data || doctorsResponse || []);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [appointmentData.doctorId]);

  // Load available time slots when date is selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDoctor && appointmentData.appointmentDate) {
        try {
          setLoading(true);
          const slotsResponse = await getDoctorTimeSlots(
            selectedDoctor.id, 
            appointmentData.appointmentDate,
            30 
          );
          setAvailableSlots(slotsResponse.data || slotsResponse || []);
        } catch (error) {
          console.error('Failed to load time slots:', error);
          setError('Failed to load available time slots');
        } finally {
          setLoading(false);
        }
      }
    };

    loadTimeSlots();
  }, [selectedDoctor, appointmentData.appointmentDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors(filters);
      setDoctors(response.data || response || []);
    } catch (error) {
      console.error('Failed to search doctors:', error);
      setError('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentData(prev => ({
      ...prev,
      doctorId: doctor.id
    }));
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setAppointmentData(prev => ({
      ...prev,
      appointmentTime: timeSlot.time
    }));
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const bookingData = {
        ...appointmentData,
        patientId: user.id
      };

      await bookAppointment(bookingData);
      
      
      navigate('/appointments?success=booking');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setError('Failed to book appointment');
    }
  };

  const goBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedDoctor(null);
        setAppointmentData(prev => ({
          ...prev,
          doctorId: '',
          appointmentDate: '',
          appointmentTime: ''
        }));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && step === 1) {
    return (
      <div className="booking-container">
        <div className="loading-state">
          <i className="ri-loader-4-line animate-spin"></i>
          <span>Loading doctors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {/* Header */}
      <div className="booking-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <i className="ri-arrow-left-line"></i>
          Back
        </button>
        <h1>Book Appointment</h1>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="ri-error-warning-line"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-btn">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="booking-step">
          <div className="step-header">
            <h2>Select a Doctor</h2>
            <p>Choose from our qualified healthcare professionals</p>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Search by name</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search doctor name"
                />
              </div>
              <div className="filter-group">
                <label>Specialization</label>
                <select
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
              </div>
              <button onClick={handleSearchDoctors} className="search-btn">
                <i className="ri-search-line"></i>
                Search
              </button>
            </div>
          </div>

          {/* Doctors List */}
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-avatar">
                  <i className="ri-user-heart-line"></i>
                </div>
                <div className="doctor-info">
                  <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="location">{doctor.location}</p>
                  <div className="doctor-stats">
                    <span className="rating">
                      <i className="ri-star-fill"></i>
                      {doctor.averageRating || '4.8'}
                    </span>
                    <span className="experience">
                      {doctor.yearsOfExperience} years exp.
                    </span>
                  </div>
                  <p className="bio">{doctor.bio}</p>
                </div>
                <button 
                  onClick={() => handleSelectDoctor(doctor)}
                  className="select-doctor-btn"
                >
                  Select Doctor
                </button>
              </div>
            ))}
          </div>

          {doctors.length === 0 && !loading && (
            <div className="empty-state">
              <i className="ri-user-heart-line"></i>
              <h3>No doctors found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      
      {step === 2 && selectedDoctor && (
        <div className="booking-step">
          <div className="step-header">
            <h2>Select Date & Time</h2>
            <p>Choose your preferred appointment slot</p>
          </div>

          {/* Selected Doctor Summary */}
          <div className="selected-doctor">
            <div className="doctor-summary">
              <div className="doctor-avatar">
                <i className="ri-user-heart-line"></i>
              </div>
              <div className="doctor-details">
                <h3>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                <p>{selectedDoctor.specialization}</p>
              </div>
              <button onClick={goBackStep} className="change-doctor-btn">
                Change Doctor
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="date-selection">
            <label htmlFor="appointmentDate">Select Date</label>
            <input
              id="appointmentDate"
              type="date"
              name="appointmentDate"
              value={appointmentData.appointmentDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {appointmentData.appointmentDate && (
              <p className="selected-date">
                {formatDate(appointmentData.appointmentDate)}
              </p>
            )}
          </div>

          {/* Time Slots */}
          {appointmentData.appointmentDate && (
            <div className="time-slots">
              <h3>Available Time Slots</h3>
              {loading ? (
                <div className="loading-state">
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Loading available slots...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`time-slot ${appointmentData.appointmentTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                      disabled={!slot.available}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="ri-calendar-line"></i>
                  <p>No available slots for this date</p>
                  <p>Please select a different date</p>
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {appointmentData.appointmentTime && (
            <div className="step-actions">
              <button onClick={() => setStep(3)} className="continue-btn">
                Continue to Details
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Appointment Details */}
      {step === 3 && (
        <div className="booking-step">
          <div className="step-header">
            <h2>Appointment Details</h2>
            <p>Provide additional information for your appointment</p>
          </div>

          {/* Appointment Summary */}
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <div className="summary-details">
              <p><strong>Doctor:</strong> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
              <p><strong>Date:</strong> {formatDate(appointmentData.appointmentDate)}</p>
              <p><strong>Time:</strong> {formatTime(appointmentData.appointmentTime)}</p>
            </div>
          </div>

          {/* Appointment Form */}
          <form onSubmit={handleSubmitAppointment} className="appointment-form">
            <div className="form-group">
              <label htmlFor="appointmentType">Appointment Type</label>
              <select
                id="appointmentType"
                name="appointmentType"
                value={appointmentData.appointmentType}
                onChange={handleInputChange}
                required
              >
                <option value="consultation">General Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="check-up">Regular Check-up</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Visit</label>
              <input
                id="reason"
                type="text"
                name="reason"
                value={appointmentData.reason}
                onChange={handleInputChange}
                placeholder="Brief description of your concern"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={appointmentData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information for the doctor (optional)"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={goBackStep} className="back-step-btn">
                <i className="ri-arrow-left-line"></i>
                Back
              </button>
              <button 
                type="submit" 
                className="book-appointment-btn"
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Booking...
                  </>
                ) : (
                  <>
                    <i className="ri-calendar-check-line"></i>
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AppointmentBooking;