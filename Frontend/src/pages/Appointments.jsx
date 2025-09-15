import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useAppointments } from '../context/GlobalContext.js';

function Appointments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isPatient, isDoctor } = useAuth();
  const { 
    appointments,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    updateAppointmentData,
    cancelAppointmentData,
    loading 
  } = useAppointments();

  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'upcoming');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(null);

  
  const successMessage = searchParams.get('success');


  const formatAppointments = (appointments) => {
    if (!Array.isArray(appointments)) return [];
    
    return appointments.map(apt => ({
      id: apt.id,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      status: apt.status,
      appointmentType: apt.appointment_type || 'Consultation',
      reasonForVisit: apt.reason_for_visit,
      consultationFee: apt.consultation_fee,
      consultationNotes: apt.consultation_notes,
      doctor: apt.doctor ? {
        id: apt.doctor.id,
        firstName: apt.doctor.first_name,
        lastName: apt.doctor.last_name,
        specialization: apt.doctor.specialization,
        email: apt.doctor.email,
        phone: apt.doctor.phone,
        location: apt.doctor.location || 'Medical Center'
      } : null,
      patient: apt.patient ? {
        id: apt.patient.id,
        firstName: apt.patient.first_name,
        lastName: apt.patient.last_name,
        email: apt.patient.email,
        phone: apt.patient.phone,
        dateOfBirth: apt.patient.date_of_birth
      } : null
    }));
  };

 
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setError(null);
        
        if (isPatient()) {
          await fetchPatientAppointments();
        } else if (isDoctor()) {
          await fetchDoctorAppointments();
        }
      } catch (error) {
        console.error('Failed to load appointments:', error);
        setError('Failed to load appointments');
      }
    };

    if (user) {
      loadAppointments();
    }
  }, [user, isPatient, isDoctor, fetchPatientAppointments, fetchDoctorAppointments]);

  
  useEffect(() => {
    const formattedAppointments = formatAppointments(appointments);
    
    if (!formattedAppointments.length) {
      setFilteredAppointments([]);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filtered = [];

    switch (activeFilter) {
      case 'upcoming':
        filtered = formattedAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return ['confirmed', 'pending'].includes(apt.status);
        });
        break;
      case 'past':
        filtered = formattedAppointments.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        filtered = formattedAppointments.filter(apt => apt.status === 'cancelled');
        break;
      default:
        filtered = formattedAppointments;
    }

   
    filtered = filtered.filter(apt => {
      const matchesSearch = isPatient() ? 
        (apt.doctor?.firstName + ' ' + apt.doctor?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor?.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) :
        (apt.patient?.firstName + ' ' + apt.patient?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patient?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDoctor = !filterDoctor || (apt.doctor?.firstName + ' ' + apt.doctor?.lastName) === filterDoctor;
      const matchesType = !filterType || apt.appointmentType === filterType;

      return matchesSearch && matchesDoctor && matchesType;
    });

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime || '00:00'}`);
      const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime || '00:00'}`);
      return dateB - dateA; // Most recent first
    });

    setFilteredAppointments(filtered);
  }, [appointments, activeFilter, searchQuery, filterDoctor, filterType, isPatient]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'upcoming') {
      newSearchParams.delete('filter');
    } else {
      newSearchParams.set('filter', filter);
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointmentData(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError('Failed to cancel appointment');
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentData(appointmentId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      setError('Failed to update appointment status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const isUpcoming = (appointmentDate, appointmentTime) => {
    if (!appointmentDate || !appointmentTime) return false;
    try {
      const aptDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      return aptDateTime > new Date();
    } catch {
      return false;
    }
  };

  // Get unique doctors and types for filters
  const uniqueDoctors = [...new Set(filteredAppointments.map(apt => 
    apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : ''
  ).filter(Boolean))];

  const uniqueTypes = [...new Set(filteredAppointments.map(apt => apt.appointmentType).filter(Boolean))];

  // Count appointments by status
  const appointmentCounts = {
    upcoming: formatAppointments(appointments).filter(a => ['confirmed', 'pending'].includes(a.status)).length,
    past: formatAppointments(appointments).filter(a => a.status === 'completed').length,
    cancelled: formatAppointments(appointments).filter(a => a.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to={isPatient() ? "/patient-dashboard" : "/doctor-dashboard"}>
                <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: '"Pacifico", serif' }}>
                  HealthCare Pro
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20${isPatient() ? 'patient' : 'doctor'}%20profile%20photo%2C%20friendly%20smile%2C%20clean%20background%2C%20headshot%20portrait%20style%2C%20healthcare%20professional%20appearance&width=150&height=150&seq=${isPatient() ? 'patient' : 'doctor'}-profile&orientation=squarish')`
                  }}
                ></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {isDoctor() && 'Dr. '}{user?.first_name || user?.firstName} {user?.last_name || user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{isPatient() ? 'Patient' : 'Doctor'}</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors p-2"
                title="Logout"
              >
                <i className="ri-logout-circle-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to={isPatient() ? "/patient-dashboard" : "/doctor-dashboard"} className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">
              Dashboard
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm"></i>
            <span className="text-sm text-gray-600 ml-2">My Appointments</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h2>
          <p className="text-gray-600">Manage your healthcare appointments</p>
        </div>

        {/* Success Message */}
        {successMessage === 'booking' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-check-circle-line text-green-600 mr-2"></i>
              <span className="text-green-800 font-medium">Appointment booked successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-600 mr-2"></i>
                <span className="text-red-800">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search appointments..."
              />
              <i className="ri-search-line absolute right-3 top-2.5 text-gray-400"></i>
            </div>
            
            {isPatient() && (
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
              >
                <option value="">All Doctors</option>
                {uniqueDoctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            )}
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            {isPatient() && (
              <Link
                to="/book-appointment"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Book New
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'upcoming', label: 'Upcoming', count: appointmentCounts.upcoming },
                { id: 'past', label: 'Past', count: appointmentCounts.past },
                { id: 'cancelled', label: 'Cancelled', count: appointmentCounts.cancelled }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeFilter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-6">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Photo */}
                        <div 
                          className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0"
                          style={{
                            backgroundImage: isPatient() ? 
                              `url('https://readdy.ai/api/search-image?query=Professional%20medical%20doctor%20portrait%2C%20${appointment.doctor?.firstName?.toLowerCase()}%20healthcare%20provider%20in%20white%20coat%20with%20stethoscope%2C%20friendly%20professional%20smile%2C%20medical%20office%20background%2C%20clinical%20setting&width=150&height=150&seq=doctor-${appointment.doctor?.id}&orientation=squarish')` :
                              `url('https://readdy.ai/api/search-image?query=Professional%20patient%20headshot%20photo%20for%20medical%20records%2C%20${appointment.patient?.firstName?.toLowerCase()}%20patient%20portrait%2C%20neutral%20expression%2C%20clean%20background%2C%20healthcare%20patient%20photo&width=150&height=150&seq=patient-${appointment.patient?.id}&orientation=squarish')`
                          }}
                        ></div>

                        {/* Appointment Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              {isPatient() ? (
                                <>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                                  </h3>
                                  <p className="text-sm text-blue-600 font-medium">{appointment.doctor?.specialization}</p>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                                </>
                              )}
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${getStatusClass(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <i className="ri-calendar-line mr-2 text-blue-600"></i>
                              <span>{formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-file-text-line mr-2 text-blue-600"></i>
                              <span>{appointment.appointmentType}</span>
                            </div>
                            {isPatient() && appointment.doctor?.location && (
                              <div className="flex items-center">
                                <i className="ri-map-pin-line mr-2 text-blue-600"></i>
                                <span>{appointment.doctor.location}</span>
                              </div>
                            )}
                            {appointment.consultationFee && (
                              <div className="flex items-center">
                                <i className="ri-money-dollar-circle-line mr-2 text-blue-600"></i>
                                <span>${appointment.consultationFee}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {appointment.status === 'confirmed' && isUpcoming(appointment.appointmentDate, appointment.appointmentTime) && (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap">
                                <i className="ri-video-line mr-2"></i>
                                Join Video Call
                              </button>
                            )}

                            {isPatient() && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                              <>
                                <button 
                                  onClick={() => handleRescheduleAppointment(appointment)}
                                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  <i className="ri-calendar-event-line mr-2"></i>
                                  Reschedule
                                </button>
                                <button 
                                  onClick={() => handleCancelAppointment(appointment)}
                                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  <i className="ri-close-line mr-2"></i>
                                  Cancel
                                </button>
                              </>
                            )}

                            {isDoctor() && appointment.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  <i className="ri-check-line mr-2"></i>
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  <i className="ri-close-line mr-2"></i>
                                  Decline
                                </button>
                              </>
                            )}

                            {isDoctor() && appointment.status === 'confirmed' && (
                              <button 
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                <i className="ri-check-line mr-2"></i>
                                Mark Complete
                              </button>
                            )}

                            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap">
                              <i className="ri-eye-line mr-2"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-calendar-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeFilter} appointments found
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeFilter === 'upcoming' ? 'You don\'t have any upcoming appointments.' : 
                   activeFilter === 'past' ? 'No past appointments to show.' : 
                   'No cancelled appointments.'}
                </p>
                {isPatient() && activeFilter === 'upcoming' && (
                  <Link
                    to="/book-appointment"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    Book Your First Appointment
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Current appointment with {isPatient() ? 
                  `Dr. ${selectedAppointment.doctor?.firstName} ${selectedAppointment.doctor?.lastName}` :
                  `${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`
                } on {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel your appointment with {isPatient() ? 
                  `Dr. ${selectedAppointment.doctor?.firstName} ${selectedAppointment.doctor?.lastName}` :
                  `${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`
                } on {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}?
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation</label>
                <select 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="">Select reason</option>
                  <option value="schedule_conflict">Schedule conflict</option>
                  <option value="personal_reasons">Personal reasons</option>
                  <option value="medical_emergency">Medical emergency</option>
                  <option value="doctor_unavailable">Doctor unavailable</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Keep Appointment
              </button>
              <button 
                onClick={confirmCancelAppointment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;