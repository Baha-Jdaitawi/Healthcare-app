import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';
import {  getDoctorTodayAppointments, getDoctorUpcomingAppointments } from '../services/doctors.js';
import { getPatientDocuments } from '../services/documents.js';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [ setUpcomingAppointments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  const formatAppointments = (appointments) => {
    return appointments.map(apt => ({
      id: apt.id,
      patientName: `${apt.patient?.first_name || ''} ${apt.patient?.last_name || ''}`.trim(),
      time: apt.appointment_time,
      date: apt.appointment_date,
      type: apt.appointment_type || 'Consultation',
      duration: apt.duration || '30 min',
      status: apt.status,
      patientEmail: apt.patient?.email,
      patientPhone: apt.patient?.phone,
      reasonForVisit: apt.reason_for_visit,
      consultationFee: apt.consultation_fee
    }));
  };


  const formatDocuments = (docs) => {
    return docs.map(doc => ({
      id: doc.id,
      fileName: doc.document_name,
      type: doc.document_type,
      fileSize: doc.file_size,
      createdAt: doc.created_at,
      filePath: doc.file_path,
      description: doc.description,
      patientId: doc.patient_id,
      uploadedBy: doc.uploaded_by
    }));
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load today's appointments
        const todayResponse = await getDoctorTodayAppointments();
        const todayData = todayResponse.data || todayResponse;
        setTodayAppointments(formatAppointments(Array.isArray(todayData) ? todayData : []));

        
        const upcomingResponse = await getDoctorUpcomingAppointments(5);
        const upcomingData = upcomingResponse.data || upcomingResponse;
        setUpcomingAppointments(formatAppointments(Array.isArray(upcomingData) ? upcomingData : []));

        
        try {
          const documentsResponse = await getPatientDocuments({ 
            limit: 5, 
            sortBy: 'created_at', 
            sortOrder: 'desc' 
          });
          const docsData = documentsResponse.data || documentsResponse;
          setRecentDocuments(formatDocuments(Array.isArray(docsData) ? docsData : []));
        } catch (docError) {
          console.log('Documents not available:', docError);
          setRecentDocuments([]);
        }

        
        setDashboardData({
          totalPatients: 347,
          averageRating: 4.8,
          appointmentsToday: todayData?.length || 0,
          upcomingAppointments: upcomingData?.length || 0,
          weeklyAppointments: 28,
          monthlyAppointments: 95,
          totalReviews: 247,
          responseRate: 95
        });

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getAppointmentStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index} 
        className={`ri-star-${index < rating ? 'fill' : 'line'} text-yellow-400`}
      ></i>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
              <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: '"Pacifico", serif' }}>
                HealthCare Pro
              </h1>
              <span className="ml-3 text-sm text-gray-500">Doctor Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
             
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  5
                </span>
              </button>
              
             
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20doctor%20portrait%20of%20middle-aged%20medical%20professional%20in%20white%20coat%2C%20confident%20smile%2C%20stethoscope%20around%20neck%2C%20medical%20office%20background%2C%20professional%20healthcare%20provider%20headshot%2C%20clean%20medical%20environment&width=150&height=150&seq=doctor-profile&orientation=squarish')`
                  }}
                ></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {user?.first_name || user?.firstName} {user?.last_name || user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.specialization || 'Doctor'}</p>
                </div>
              </div>
              
              {/* Logout */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, Dr. {user?.first_name || user?.firstName}!
          </h2>
          <p className="text-gray-600">
            You have {dashboardData?.appointmentsToday || 0} appointments scheduled for today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-heart-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalPatients || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-star-fill text-2xl text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.averageRating || '4.8'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.appointmentsToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAppointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <Link 
                  to="/appointments"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View Full Schedule
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full bg-cover bg-center mr-3"
                            style={{
                              backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20patient%20headshot%20photo%20for%20medical%20records%2C%20neutral%20expression%2C%20clean%20background%2C%20healthcare%20patient%20portrait%2C%20diverse%20patient%20demographic&width=100&height=100&seq=patient-${appointment.id}&orientation=squarish')`
                            }}
                          ></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getAppointmentStatusClass(appointment.status)}`}>
                          {appointment.status === 'in-progress' ? 'In Progress' : 
                           appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <i className="ri-time-line mr-2"></i>
                          <span>{formatTime(appointment.time)}</span>
                          <span className="mx-2">•</span>
                          <span>{appointment.duration}</span>
                        </div>
                        {appointment.status === 'confirmed' && (
                          <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap">
                            Start Session
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-calendar-line text-4xl text-gray-300 mb-3"></i>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">No appointments today</h4>
                    <p className="text-gray-600">Enjoy your free day!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                <Link 
                  to="/documents"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View All Documents
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <i className="ri-file-text-line text-blue-600"></i>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 truncate">{document.fileName}</h4>
                            <p className="text-sm text-gray-600">{document.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(document.createdAt)}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 transition-colors">
                          <i className="ri-eye-line mr-1"></i>
                          View
                        </button>
                        <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                          <i className="ri-download-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-file-text-line text-4xl text-gray-300 mb-3"></i>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">No recent documents</h4>
                    <p className="text-gray-600">Documents will appear here as they are uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

   
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/appointments"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-line text-2xl text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">View Schedule</h4>
                  <p className="text-sm text-gray-600">Manage appointments</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/doctor/profile"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-settings-line text-2xl text-green-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Manage Profile</h4>
                  <p className="text-sm text-gray-600">Update information</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/documents"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-upload-line text-2xl text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Documents</h4>
                  <p className="text-sm text-gray-600">Manage files</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        
        {dashboardData && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-blue-600">{dashboardData.weeklyAppointments || 0}</h4>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-green-600">{dashboardData.monthlyAppointments || 0}</h4>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-yellow-600">{dashboardData.totalReviews || 0}</h4>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-purple-600">{dashboardData.responseRate || 95}%</h4>
                <p className="text-sm text-gray-600">Response Rate</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorDashboard;