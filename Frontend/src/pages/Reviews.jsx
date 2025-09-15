import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';
import { getMyReviews, createReview, updateReview, deleteReview, respondToReview } from '../services/reviews.js';
import { getAllDoctors } from '../services/doctors.js';

export default function Reviews() {
  const {  isPatient, isDoctor } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [newReview, setNewReview] = useState({
    doctorId: '',
    rating: 5,
    comment: ''
  });

  const [responseText, setResponseText] = useState('');

  // Load reviews and doctors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user's reviews
        const reviewsResponse = await getMyReviews();
        setReviews(reviewsResponse.data || reviewsResponse || []);

        // Load doctors for review creation (patients only)
        if (isPatient()) {
          const doctorsResponse = await getAllDoctors();
          setDoctors(doctorsResponse.data || doctorsResponse || []);
        }

      } catch (error) {
        console.error('Failed to load reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPatient]);

  const handleCreateReview = async (e) => {
    e.preventDefault();

    if (!newReview.doctorId || !newReview.rating || !newReview.comment.trim()) {
      return;
    }

    try {
      setError(null);
      const response = await createReview(newReview);
      
      // Add new review to list
      setReviews(prev => [response.data || response, ...prev]);
      
      // Reset form and close modal
      setNewReview({
        doctorId: '',
        rating: 5,
        comment: ''
      });
      setShowCreateModal(false);

    } catch (error) {
      console.error('Failed to create review:', error);
      setError('Failed to create review');
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      setError(null);
      const response = await updateReview(reviewId, updatedData);
      
      // Update review in list
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...response.data } : review
        )
      );

    } catch (error) {
      console.error('Failed to update review:', error);
      setError('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setError(null);
      await deleteReview(reviewId);
      
      // Remove review from list
      setReviews(prev => prev.filter(review => review.id !== reviewId));

    } catch (error) {
      console.error('Failed to delete review:', error);
      setError('Failed to delete review');
    }
  };

  const handleRespondToReview = async (e) => {
    e.preventDefault();

    if (!selectedReview || !responseText.trim()) {
      return;
    }

    try {
      setError(null);
      await respondToReview(selectedReview.id, {
        response: responseText
      });
      
      // Update review in list
      setReviews(prev => 
        prev.map(review => 
          review.id === selectedReview.id 
            ? { ...review, doctorResponse: responseText, respondedAt: new Date().toISOString() }
            : review
        )
      );

      setResponseText('');
      setSelectedReview(null);
      setShowResponseModal(false);

    } catch (error) {
      console.error('Failed to respond to review:', error);
      setError('Failed to respond to review');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`text-lg transition-colors ${
              interactive 
                ? 'cursor-pointer hover:text-yellow-400' 
                : 'cursor-default'
            } ${
              star <= rating 
                ? 'ri-star-fill text-yellow-400' 
                : 'ri-star-line text-gray-300'
            }`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            disabled={!interactive}
          >
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
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
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
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
              <Link 
                to={isPatient() ? "/patient-dashboard" : "/doctor-dashboard"}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="ri-dashboard-line text-xl"></i>
              </Link>
              <Link 
                to="/appointments"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="ri-calendar-line text-xl"></i>
              </Link>
              <Link 
                to="/login"
                className="text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <i className="ri-logout-circle-line text-xl"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Link to={isPatient() ? "/patient-dashboard" : "/doctor-dashboard"} className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">
                Dashboard
              </Link>
              <i className="ri-arrow-right-s-line text-gray-400 text-sm"></i>
              <span className="text-sm text-gray-600 ml-2">Reviews</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isPatient() ? 'My Reviews' : 'Patient Reviews'}
            </h2>
            <p className="text-gray-600">
              {isPatient() 
                ? 'Share your experience and read reviews from other patients' 
                : 'View and respond to patient feedback'
              }
            </p>
          </div>
          {isPatient() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Write Review
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: isPatient() 
                              ? `url('https://readdy.ai/api/search-image?query=Professional%20medical%20doctor%20portrait%2C%20${review.doctor?.lastName}%20healthcare%20provider%20in%20white%20coat%20with%20stethoscope%2C%20friendly%20professional%20smile%2C%20medical%20office%20background%2C%20clinical%20setting&width=150&height=150&seq=doctor-review-${review.doctorId}&orientation=squarish')`
                              : `url('https://readdy.ai/api/search-image?query=Professional%20patient%20headshot%20photo%2C%20${review.patient?.firstName}%20patient%20portrait%2C%20neutral%20expression%2C%20clean%20background%2C%20healthcare%20patient%20photo&width=150&height=150&seq=patient-review-${review.id}&orientation=squarish')`
                          }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {isPatient() 
                              ? `Dr. ${review.doctor?.firstName} ${review.doctor?.lastName}`
                              : `${review.patient?.firstName} ${review.patient?.lastName}`
                            }
                          </h4>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isPatient() && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              const updatedComment = prompt('Update your review:', review.comment);
                              if (updatedComment && updatedComment !== review.comment) {
                                handleUpdateReview(review.id, { comment: updatedComment });
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {/* Doctor Response */}
                    {review.doctorResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <i className="ri-user-heart-line text-blue-600 mr-2"></i>
                          <span className="font-medium text-blue-900">Doctor's Response</span>
                          <span className="text-sm text-blue-700 ml-auto">
                            {new Date(review.respondedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-blue-800">{review.doctorResponse}</p>
                      </div>
                    )}

                    {/* Response Button for Doctors */}
                    {isDoctor() && !review.doctorResponse && (
                      <button 
                        onClick={() => {
                          setSelectedReview(review);
                          setShowResponseModal(true);
                        }}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <i className="ri-reply-line mr-2"></i>
                        Respond to Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-star-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">
                  {isPatient() 
                    ? 'Write your first review to help other patients'
                    : 'Patient reviews will appear here'
                  }
                </p>
                {isPatient() && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    Write Your First Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Review Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleCreateReview} className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                  <select
                    value={newReview.doctorId}
                    onChange={(e) => setNewReview(prev => ({ ...prev, doctorId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {renderStars(newReview.rating, true, (rating) => 
                      setNewReview(prev => ({ ...prev, rating }))
                    )}
                    <span className="text-sm text-gray-600 ml-4">
                      {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this doctor..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={5}
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {newReview.comment.length}/500 characters
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newReview.doctorId || !newReview.comment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <i className="ri-send-plane-line mr-2"></i>
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Respond to Review</h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* Original Review */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Patient's Review:</h4>
                <div className="flex items-center mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-gray-700">"{selectedReview.comment}"</p>
              </div>

              <form onSubmit={handleRespondToReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Thank the patient and address their feedback..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!responseText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <i className="ri-send-plane-line mr-2"></i>
                    Send Response
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}