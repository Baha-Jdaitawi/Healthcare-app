import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';
import { getAllDoctors, searchDoctors } from '../services/doctors.js';
import { getAllSpecializations } from '../services/specializations.js';

function DoctorSearch() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get('specialization') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('minRating') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  const locations = [
    'All Locations',
    'New York, NY',
    'Los Angeles, CA', 
    'Chicago, IL',
    'Houston, TX',
    'Miami, FL',
    'Boston, MA',
    'San Francisco, CA',
    'Seattle, WA'
  ];

 
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load specializations for filter dropdown
        const specializationsResponse = await getAllSpecializations();
        setSpecializations(specializationsResponse.data || specializationsResponse || []);

        // Load doctors with initial filters
        await searchDoctorsWithFilters();

      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search doctors with current filters
  const searchDoctorsWithFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        search: searchQuery,
        specialization: selectedSpecialization,
        location: selectedLocation === 'All Locations' ? '' : selectedLocation,
        minRating: selectedRating,
        sortBy: 'rating',
        sortOrder: 'desc'
      };

      let response;
      if (filters.search || filters.specialization || filters.location || filters.minRating) {
        response = await searchDoctors(filters);
      } else {
        response = await getAllDoctors({
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        });
      }

      
      const formattedDoctors = formatDoctorData(response.data || response || []);
      setDoctors(formattedDoctors);

    } catch (error) {
      console.error('Failed to search doctors:', error);
      setError('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

 
  const formatDoctorData = (doctorsData) => {
    if (!doctorsData || !Array.isArray(doctorsData)) return [];
    
    return doctorsData.map(doctor => ({
      id: doctor.id,
      firstName: doctor.first_name || doctor.firstName,
      lastName: doctor.last_name || doctor.lastName,
      email: doctor.email,
      specialization: doctor.specialization,
      location: doctor.location || 'Location not specified',
      bio: doctor.bio || doctor.description,
      yearsOfExperience: doctor.years_of_experience || doctor.experience,
      qualifications: doctor.qualifications,
      consultationFee: doctor.consultation_fee || doctor.fee,
      averageRating: doctor.average_rating || doctor.rating || 4.8,
      totalReviews: doctor.total_reviews || doctor.reviewCount || 0,
      totalPatients: doctor.total_patients || doctor.patientCount || 0,
      profilePicture: doctor.profile_picture,
      availability: doctor.availability || 'Available',
      verified: doctor.verified || false
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = async () => {
    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set('search', searchQuery);
    if (selectedSpecialization) newSearchParams.set('specialization', selectedSpecialization);
    if (selectedLocation && selectedLocation !== 'All Locations') newSearchParams.set('location', selectedLocation);
    if (selectedRating) newSearchParams.set('minRating', selectedRating);
    setSearchParams(newSearchParams);

    await searchDoctorsWithFilters();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedRating('');
    setSelectedLocation('');
    setSearchParams({});
    searchDoctorsWithFilters();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index}
        className={`ri-star-${index < Math.floor(rating) ? 'fill' : 'line'} text-yellow-400 text-sm`}
      ></i>
    ));
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery === '' || 
      doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = !selectedSpecialization || 
      doctor.specialization === selectedSpecialization;
    
    const matchesRating = !selectedRating || 
      doctor.averageRating >= parseFloat(selectedRating);
    
    const matchesLocation = !selectedLocation || selectedLocation === 'All Locations' || 
      doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialization && matchesRating && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/patient-dashboard">
                <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: '"Pacifico", serif' }}>
                  HealthCare Pro
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/patient-dashboard"
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
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare Providers</h2>
          <p className="text-gray-600">Browse and connect with qualified medical professionals</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Doctors</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Search by name or specialty"
                  />
                  <i className="ri-search-line absolute right-3 top-2.5 text-gray-400"></i>
                </div>
              </div>

              {/* Specialization Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec.id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="ri-search-line mr-2"></i>
                      Search Doctors
                    </>
                  )}
                </button>
                
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {loading ? 'Searching...' : `Showing ${filteredDoctors.length} healthcare providers`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="ri-error-warning-line text-red-600 mr-2"></i>
                    <p className="text-red-800">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Doctors List */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <i className="ri-loader-4-line animate-spin text-blue-600 text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching doctors...</h3>
                  <p className="text-gray-600">Please wait while we find the best healthcare providers for you</p>
                </div>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {/* Doctor Photo */}
                      <div 
                        className="w-20 h-20 rounded-full bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: doctor.profilePicture ? 
                            `url(${doctor.profilePicture})` : 
                            `url('https://readdy.ai/api/search-image?query=Professional%20medical%20doctor%20portrait%2C%20${doctor.lastName.toLowerCase()}%20healthcare%20provider%20in%20white%20coat%20with%20stethoscope%2C%20friendly%20professional%20smile%2C%20medical%20office%20background%2C%20clinical%20setting%2C%20professional%20healthcare%20photography&width=200&height=200&seq=doctor-${doctor.id}&orientation=squarish')`
                        }}
                      ></div>

                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                            {doctor.verified && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                                <i className="ri-verified-badge-line mr-1"></i>
                                Verified
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            doctor.availability === 'Available' ? 'bg-green-100 text-green-800' :
                            doctor.availability === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doctor.availability}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            {renderStars(doctor.averageRating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {doctor.averageRating.toFixed(1)} ({doctor.totalReviews} reviews)
                          </span>
                        </div>

                        {/* Experience & Location */}
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <i className="ri-award-line mr-1"></i>
                          <span>{doctor.yearsOfExperience} years experience</span>
                          <span className="mx-2">•</span>
                          <i className="ri-map-pin-line mr-1"></i>
                          <span>{doctor.location}</span>
                        </div>

                        {/* Bio */}
                        {doctor.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doctor.bio}</p>
                        )}

                        {/* Consultation Fee */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-600">Consultation:</span>
                            <span className="font-semibold text-gray-900 ml-1">
                              ${doctor.consultationFee || 150}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Link
                              to={`/doctor/${doctor.id}`}
                              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Profile
                            </Link>
                            <Link
                              to={`/book-appointment/${doctor.id}`}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                doctor.availability === 'Available' 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <i className="ri-user-search-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or clear filters to see all available doctors
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Show All Doctors
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSearch;