import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';
import { getAllDoctorsAdmin, verifyDoctor, updateDoctorStatus } from '../services/doctors.js';
import { getAllPatientsAdmin } from '../services/patients.js';
import { getAllDocumentsAdmin } from '../services/documents.js';
import { getAllReviewsAdmin, verifyReview } from '../services/reviews.js';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [dashboardStats, setDashboardStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalDocuments: 0,
    pendingDoctors: 0,
    pendingReviews: 0
  });
  
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load recent doctors (pending verification)
        const doctorsResponse = await getAllDoctorsAdmin({ 
          verified: false, 
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        const doctorsData = doctorsResponse.data || doctorsResponse;
        setRecentDoctors(Array.isArray(doctorsData) ? doctorsData : []);

        // Load recent patients
        const patientsResponse = await getAllPatientsAdmin({ 
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        const patientsData = patientsResponse.data || patientsResponse;
        setRecentPatients(Array.isArray(patientsData) ? patientsData : []);

        // Load pending reviews
        const reviewsResponse = await getAllReviewsAdmin({ 
          status: 'pending',
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        const reviewsData = reviewsResponse.data || reviewsResponse;
        setPendingReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // Load recent documents
        const documentsResponse = await getAllDocumentsAdmin({ 
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        const documentsData = documentsResponse.data || documentsResponse;
        setRecentDocuments(Array.isArray(documentsData) ? documentsData : []);

        // Calculate dashboard stats
        const allDoctorsResponse = await getAllDoctorsAdmin();
        const allPatientsResponse = await getAllPatientsAdmin();
        const allDocumentsResponse = await getAllDocumentsAdmin();
        const allReviewsResponse = await getAllReviewsAdmin();

        const allDoctors = allDoctorsResponse.data || allDoctorsResponse || [];
        const allPatients = allPatientsResponse.data || allPatientsResponse || [];
        const allDocuments = allDocumentsResponse.data || allDocumentsResponse || [];
        const allReviews = allReviewsResponse.data || allReviewsResponse || [];

        setDashboardStats({
          totalDoctors: Array.isArray(allDoctors) ? allDoctors.length : 0,
          totalPatients: Array.isArray(allPatients) ? allPatients.length : 0,
          totalDocuments: Array.isArray(allDocuments) ? allDocuments.length : 0,
          pendingDoctors: Array.isArray(allDoctors) ? allDoctors.filter(d => !d.verified).length : 0,
          pendingReviews: Array.isArray(allReviews) ? allReviews.filter(r => r.status === 'pending').length : 0,
          totalAppointments: 0 // Would need appointment admin endpoint
        });

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleVerifyDoctor = async (doctorId, verified = true) => {
    try {
      await verifyDoctor(doctorId, verified);
      // Refresh doctors list
      const response = await getAllDoctorsAdmin({ 
        verified: false, 
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentDoctors(response.data || response || []);
      
      // Update stats
      setDashboardStats(prev => ({
        ...prev,
        pendingDoctors: prev.pendingDoctors - 1
      }));
    } catch (error) {
      console.error('Failed to verify doctor:', error);
    }
  };

  const handleUpdateDoctorStatus = async (doctorId, status) => {
    try {
      await updateDoctorStatus(doctorId, status);
      // Refresh doctors list
      const response = await getAllDoctorsAdmin({ 
        verified: false, 
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentDoctors(response.data || response || []);
    } catch (error) {
      console.error('Failed to update doctor status:', error);
    }
  };

  const handleVerifyReview = async (reviewId, verified = true) => {
    try {
      await verifyReview(reviewId, verified);
      // Refresh reviews list
      const response = await getAllReviewsAdmin({ 
        status: 'pending',
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setPendingReviews(response.data || response || []);
      
      // Update stats
      setDashboardStats(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews - 1
      }));
    } catch (error) {
      console.error('Failed to verify review:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <i className="ri-loader-4-line animate-spin"></i>
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <i className="ri-error-warning-line"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <i className="ri-health-book-line"></i>
              <span>HealthCare Admin</span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">Administrator</span>
              </div>
              <div className="user-avatar">
                <i className="ri-admin-line"></i>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <i className="ri-logout-box-r-line"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1>Admin Dashboard</h1>
            <p>Manage your healthcare platform</p>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="ri-user-heart-line"></i>
              </div>
              <div className="stat-content">
                <h3>{dashboardStats.totalDoctors}</h3>
                <p>Total Doctors</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="ri-user-line"></i>
              </div>
              <div className="stat-content">
                <h3>{dashboardStats.totalPatients}</h3>
                <p>Total Patients</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="ri-file-text-line"></i>
              </div>
              <div className="stat-content">
                <h3>{dashboardStats.totalDocuments}</h3>
                <p>Total Documents</p>
              </div>
            </div>
            <div className="stat-card urgent">
              <div className="stat-icon">
                <i className="ri-time-line"></i>
              </div>
              <div className="stat-content">
                <h3>{dashboardStats.pendingDoctors + dashboardStats.pendingReviews}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/admin/doctors" className="action-card">
                <i className="ri-user-heart-line"></i>
                <span>Manage Doctors</span>
              </Link>
              <Link to="/admin/patients" className="action-card">
                <i className="ri-user-line"></i>
                <span>Manage Patients</span>
              </Link>
              <Link to="/admin/specializations" className="action-card">
                <i className="ri-stethoscope-line"></i>
                <span>Specializations</span>
              </Link>
              <Link to="/admin/reviews" className="action-card">
                <i className="ri-star-line"></i>
                <span>Review Management</span>
              </Link>
            </div>
          </div>

          {/* Pending Doctor Verifications */}
          {recentDoctors.length > 0 && (
            <div className="pending-section">
              <div className="section-header">
                <h2>Pending Doctor Verifications</h2>
                <Link to="/admin/doctors?status=pending" className="view-all-btn">
                  View All
                </Link>
              </div>
              <div className="pending-list">
                {recentDoctors.map(doctor => (
                  <div key={doctor.id} className="pending-card">
                    <div className="pending-info">
                      <h4>Dr. {doctor.firstName} {doctor.lastName}</h4>
                      <p>{doctor.specialization}</p>
                      <p>License: {doctor.licenseNumber}</p>
                      <p>Registered: {formatDate(doctor.createdAt)}</p>
                    </div>
                    <div className="pending-actions">
                      <button 
                        onClick={() => handleVerifyDoctor(doctor.id, true)}
                        className="btn-success"
                      >
                        <i className="ri-check-line"></i>
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateDoctorStatus(doctor.id, 'rejected')}
                        className="btn-danger"
                      >
                        <i className="ri-close-line"></i>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Patients */}
          <div className="recent-section">
            <div className="section-header">
              <h2>Recent Patients</h2>
              <Link to="/admin/patients" className="view-all-btn">
                View All
              </Link>
            </div>
            <div className="recent-list">
              {recentPatients.length > 0 ? (
                recentPatients.map(patient => (
                  <div key={patient.id} className="recent-card">
                    <div className="recent-info">
                      <h4>{patient.firstName} {patient.lastName}</h4>
                      <p>{patient.email}</p>
                      <p>Joined: {formatDate(patient.createdAt)}</p>
                    </div>
                    <div className="recent-status">
                      <span className={`status ${patient.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {patient.status || 'active'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="ri-user-line"></i>
                  <p>No recent patients</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <div className="pending-section">
              <div className="section-header">
                <h2>Pending Review Approvals</h2>
                <Link to="/admin/reviews?status=pending" className="view-all-btn">
                  View All
                </Link>
              </div>
              <div className="pending-list">
                {pendingReviews.map(review => (
                  <div key={review.id} className="pending-card">
                    <div className="pending-info">
                      <h4>Review for Dr. {review.doctor?.firstName} {review.doctor?.lastName}</h4>
                      <p>By: {review.patient?.firstName} {review.patient?.lastName}</p>
                      <p>Rating: {review.rating}/5</p>
                      <p className="review-text">{review.comment}</p>
                      <p>Submitted: {formatDate(review.createdAt)}</p>
                    </div>
                    <div className="pending-actions">
                      <button 
                        onClick={() => handleVerifyReview(review.id, true)}
                        className="btn-success"
                      >
                        <i className="ri-check-line"></i>
                        Approve
                      </button>
                      <button 
                        onClick={() => handleVerifyReview(review.id, false)}
                        className="btn-danger"
                      >
                        <i className="ri-close-line"></i>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Documents */}
          <div className="recent-section">
            <div className="section-header">
              <h2>Recent Documents</h2>
              <Link to="/admin/documents" className="view-all-btn">
                View All
              </Link>
            </div>
            <div className="recent-list">
              {recentDocuments.length > 0 ? (
                recentDocuments.map(document => (
                  <div key={document.id} className="recent-card">
                    <div className="recent-info">
                      <h4>{document.fileName}</h4>
                      <p>Type: {document.type}</p>
                      <p>Uploaded by: {document.user?.firstName} {document.user?.lastName}</p>
                      <p>Date: {formatDate(document.createdAt)}</p>
                    </div>
                    <div className="recent-status">
                      <span className={`status ${document.status === 'approved' ? 'status-approved' : 'status-pending'}`}>
                        {document.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="ri-file-text-line"></i>
                  <p>No recent documents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;