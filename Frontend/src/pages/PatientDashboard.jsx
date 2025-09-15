import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAppointments, useDocuments } from '../context/GlobalContext.js';

function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    upcomingAppointments, 
    fetchUpcomingAppointments,
    fetchTodayAppointments,
    loading: appointmentsLoading,
    error: appointmentsError 
  } = useAppointments();
  const { 
    recentDocuments,
    fetchRecentDocuments,
    loading: documentsLoading,
    error: documentsError 
  } = useDocuments();

  const [notifications] = useState(3);
  const [loadingError, setLoadingError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingError(null);
        await Promise.all([
          fetchUpcomingAppointments(2),
          fetchTodayAppointments(),
          fetchRecentDocuments(3)
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoadingError('Failed to load dashboard data. Please refresh the page.');
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, fetchUpcomingAppointments, fetchTodayAppointments, fetchRecentDocuments]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  
  const formatAppointmentData = (appointments) => {
    if (!appointments || !Array.isArray(appointments)) return [];
    
    return appointments.map(appointment => ({
      id: appointment.id,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      status: appointment.status,
      appointmentType: appointment.reason_for_visit || 'Consultation',
      consultationFee: appointment.consultation_fee,
      
      doctor: {
        id: appointment.doctor_id,
        firstName: appointment.doctor_first_name || appointment.doctor?.first_name || 'Unknown',
        lastName: appointment.doctor_last_name || appointment.doctor?.last_name || 'Doctor',
        specialization: appointment.doctor_specialization || appointment.doctor?.specialization || 'General Practice'
      }
    }));
  };

 
  const formatDocumentData = (documents) => {
    if (!documents || !Array.isArray(documents)) return [];
    
    return documents.map(document => ({
      id: document.id,
      fileName: document.document_name,
      type: document.document_type || 'Document',
      fileSize: document.file_size || '0 KB',
      createdAt: document.created_at,
      filePath: document.file_path,
      patientId: document.patient_id,
      uploadedBy: document.uploaded_by
    }));
  };

  const formattedAppointments = formatAppointmentData(upcomingAppointments);
  const formattedDocuments = formatDocumentData(recentDocuments);

  const stats = {
    totalAppointments: formattedAppointments?.length || 0,
    documentsCount: formattedDocuments?.length || 0,
    nextAppointment: formattedAppointments?.[0] ? 
      `${new Date(formattedAppointments[0].appointmentDate).toLocaleDateString()} at ${formattedAppointments[0].appointmentTime}` :
      'No upcoming appointments'
  };

  // Format file size for display
  const formatFileSize = (size) => {
    if (!size) return '0 KB';
    if (typeof size === 'string') return size;
    
    const bytes = parseInt(size);
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

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
            </div>
            
            <div className="flex items-center space-x-4">
           
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i className="ri-notification-3-line text-xl"></i>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: user?.profilePicture ? 
                      `url(${user.profilePicture})` : 
                      `url('https://readdy.ai/api/search-image?query=Professional%20patient%20profile%20photo%20of%20a%20middle-aged%20person%20in%20casual%20clothing%2C%20friendly%20smile%2C%20clean%20background%2C%20headshot%20portrait%20style%2C%20natural%20lighting%2C%20healthcare%20patient%20appearance&width=150&height=150&seq=patient-profile&orientation=squarish')`
                  }}
                ></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">Patient</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-gray-600">Here's your health summary for today</p>
        </div>

        {/* Error Message */}
        {loadingError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 mr-2"></i>
              <p className="text-red-800">{loadingError}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.documentsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-2xl text-orange-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                <p className="text-sm font-bold text-gray-900">{stats.nextAppointment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <Link 
                  to="/appointments"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <div className="text-center py-4">
                    <i className="ri-loader-4-line animate-spin text-blue-600 text-xl"></i>
                    <p className="text-sm text-gray-600 mt-2">Loading appointments...</p>
                  </div>
                ) : appointmentsError ? (
                  <div className="text-center py-4">
                    <i className="ri-error-warning-line text-red-500 text-xl mb-2"></i>
                    <p className="text-sm text-red-600">Failed to load appointments</p>
                  </div>
                ) : formattedAppointments?.length > 0 ? (
                  formattedAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.doctor.specialization}</p>
                      <p className="text-sm text-gray-500">{appointment.appointmentType}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-600">
                        <i className="ri-calendar-line mr-2"></i>
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </span>
                      </div>
                      {appointment.consultationFee && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <i className="ri-money-dollar-circle-line mr-2"></i>
                          <span>${appointment.consultationFee}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-calendar-line text-4xl text-gray-300 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h4>
                    <p className="text-gray-600 mb-4">Schedule your next appointment</p>
                    <Link 
                      to="/book-appointment"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="ri-add-line mr-2"></i>
                      Book Appointment
                    </Link>
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
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {documentsLoading ? (
                  <div className="text-center py-4">
                    <i className="ri-loader-4-line animate-spin text-blue-600 text-xl"></i>
                    <p className="text-sm text-gray-600 mt-2">Loading documents...</p>
                  </div>
                ) : documentsError ? (
                  <div className="text-center py-4">
                    <i className="ri-error-warning-line text-red-500 text-xl mb-2"></i>
                    <p className="text-sm text-red-600">Failed to load documents</p>
                  </div>
                ) : formattedDocuments?.length > 0 ? (
                  formattedDocuments.map((document) => (
                    <div key={document.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className={`text-blue-600 ${
                          document.type?.toLowerCase().includes('image') || document.fileName?.toLowerCase().includes('.jpg') || document.fileName?.toLowerCase().includes('.png') ? 'ri-image-line' :
                          document.type?.toLowerCase().includes('pdf') || document.fileName?.toLowerCase().includes('.pdf') ? 'ri-file-pdf-line' :
                          'ri-file-text-line'
                        }`}></i>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{document.fileName}</h4>
                        <p className="text-xs text-gray-500">
                          {document.type} • {formatFileSize(document.fileSize)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                        <button 
                          className="text-blue-600 hover:text-blue-700 mt-1 cursor-pointer"
                          title="Download document"
                        >
                          <i className="ri-download-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-file-text-line text-4xl text-gray-300 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h4>
                    <p className="text-gray-600 mb-4">Upload your medical documents</p>
                    <Link 
                      to="/documents"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="ri-upload-line mr-2"></i>
                      Upload Documents
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/book-appointment"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-check-line text-2xl text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Book Appointment</h4>
                  <p className="text-sm text-gray-600">Schedule a new appointment</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/doctors"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-heart-line text-2xl text-green-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Find Doctors</h4>
                  <p className="text-sm text-gray-600">Browse healthcare providers</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/documents"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ri-upload-cloud-line text-2xl text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Upload Document</h4>
                  <p className="text-sm text-gray-600">Add medical records</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;