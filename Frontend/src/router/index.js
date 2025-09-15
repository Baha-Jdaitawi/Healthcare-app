import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';

// Auth Pages
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

// Patient Pages
import PatientDashboard from '../pages/PatientDashboard.jsx';
import Appointments from '../pages/Appointments.jsx';
import AppointmentBooking from '../pages/AppointmentBooking.jsx';
import Documents from '../pages/Documents.jsx';
import PatientProfile from '../pages/PatientProfile.jsx';

// Doctor Pages
import DoctorDashboard from '../pages/DoctorDashboard.jsx';
import DoctorProfile from '../pages/DoctorProfile.jsx';
import DoctorSearch from '../pages/DoctorSearch.jsx';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard.jsx';

// Shared Pages
import NotFound from '../pages/NotFound.jsx';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute.jsx';

function AppRouter() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Register />} />
        <Route path="/signup" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Register />} />

        {/* Patient Routes */}
        <Route 
          path="/patient-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <Appointments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-appointment" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AppointmentBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-appointment/:doctorId" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AppointmentBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <Documents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient/profile" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          } 
        />

        {/* Doctor Routes */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/profile" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DoctorSearch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/:doctorId" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DoctorProfile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Management Routes */}
        <Route 
          path="/admin/doctors" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/patients" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/specializations" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reviews" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/documents" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Google OAuth Callback */}
        <Route 
          path="/auth/google/callback" 
          element={<GoogleAuthCallback />} 
        />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Helper function to determine dashboard route based on user role
function getDashboardRoute(user) {
  if (!user) return '/login';
  
  switch (user.role) {
    case 'patient':
      return '/patient-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/';
  }
}

// Google OAuth callback handler
function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    if (token && userData) {
      try {
        // Store token and user data
        localStorage.setItem('token', token);
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        
        // Redirect to appropriate dashboard
        navigate(getDashboardRoute(parsedUser), { replace: true });
      } catch (error) {
        console.error('Google auth callback error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    } else {
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default AppRouter;