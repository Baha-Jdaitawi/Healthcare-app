import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext.js';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    // Patient specific fields
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    allergies: '',
    // Doctor specific fields
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    qualifications: '',
    bio: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const specializations = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine', 
    'Gastroenterology', 'General Surgery', 'Internal Medicine', 'Neurology',
    'Obstetrics & Gynecology', 'Oncology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Radiology', 'Urology', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (formData.role === 'doctor') {
      if (!formData.specialization) {
        newErrors.specialization = 'Medical specialization is required for healthcare providers';
      }
      if (!formData.licenseNumber) {
        newErrors.licenseNumber = 'Medical license number is required for healthcare providers';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Remove confirmPassword from submission data
      const { confirmPassword, ...submitData } = formData;
      
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });
      
      await register(submitData);
      
      // Navigate based on role
      if (formData.role === 'patient') {
        navigate('/patient-dashboard');
      } else if (formData.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled by the context
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleRegister = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Healthcare Registration Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Healthcare%20registration%20concept%20with%20diverse%20medical%20professionals%20including%20doctors%20and%20nurses%20in%20modern%20hospital%20setting%2C%20patient%20registration%20desk%20with%20digital%20tablets%2C%20professional%20healthcare%20team%20welcoming%20new%20members%2C%20clean%20medical%20environment%20with%20registration%20forms%20and%20healthcare%20technology%2C%20blue%20and%20white%20medical%20color%20scheme&width=800&height=1024&seq=healthcare-registration-bg&orientation=portrait')`
        }}
      >
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
              HealthCare Pro
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Join Our Healthcare Community
            </p>
            <p className="text-lg opacity-80 leading-relaxed mb-6">
              Register as a healthcare provider or patient to access our comprehensive medical management platform. 
              Connect with professionals, manage appointments, and ensure secure healthcare data management.
            </p>
            <div className="space-y-3 text-sm opacity-90">
              <div className="flex items-center">
                <i className="ri-user-heart-line text-xl mr-3"></i>
                <span>For Healthcare Providers & Patients</span>
              </div>
              <div className="flex items-center">
                <i className="ri-hospital-line text-xl mr-3"></i>
                <span>Integrated Hospital Management</span>
              </div>
              <div className="flex items-center">
                <i className="ri-calendar-check-line text-xl mr-3"></i>
                <span>Appointment & Schedule Management</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm opacity-90">
            <div className="flex items-center">
              <i className="ri-shield-check-line text-2xl mr-2"></i>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <i className="ri-lock-line text-2xl mr-2"></i>
              <span>Medical Grade Security</span>
            </div>
            <div className="flex items-center">
              <i className="ri-award-line text-2xl mr-2"></i>
              <span>ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Healthcare Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
              HealthCare Pro
            </h1>
            <p className="text-gray-600">Create your healthcare account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Registration</h2>
            <p className="text-gray-600">Join our secure medical platform</p>
          </div>

          {/* Display auth error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.firstName 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 bg-white focus:border-blue-500'
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.lastName 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 bg-white focus:border-blue-500'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 bg-white focus:border-blue-500'
                  }`}
                  placeholder="your.email@hospital.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className={`ri-mail-line text-lg ${errors.email ? 'text-red-400' : 'text-gray-400'}`}></i>
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <i className="ri-error-warning-line mr-1"></i>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.phoneNumber 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 bg-white focus:border-blue-500'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className={`ri-phone-line text-lg ${errors.phoneNumber ? 'text-red-400' : 'text-gray-400'}`}></i>
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <i className="ri-error-warning-line mr-1"></i>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.role === 'patient' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <i className="ri-user-line text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Patient</span>
                </label>
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.role === 'doctor' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <i className="ri-user-heart-line text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Healthcare Provider</span>
                </label>
              </div>
            </div>

            {/* Healthcare Provider Specific Fields */}
            {formData.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Specialization *
                  </label>
                  <div className="relative">
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 pr-8 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer ${
                        errors.specialization 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 bg-white focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select your specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-stethoscope-line text-lg text-gray-400"></i>
                    </div>
                  </div>
                  {errors.specialization && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {errors.specialization}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical License Number *
                  </label>
                  <div className="relative">
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.licenseNumber 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 bg-white focus:border-blue-500'
                      }`}
                      placeholder="Enter your medical license number"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className={`ri-award-line text-lg ${errors.licenseNumber ? 'text-red-400' : 'text-gray-400'}`}></i>
                    </div>
                  </div>
                  {errors.licenseNumber && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Secure Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-12 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 bg-white focus:border-blue-500'
                    }`}
                    placeholder="Min 8 chars with special characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`text-lg transition-colors ${
                      showPassword ? 'ri-eye-off-line' : 'ri-eye-line'
                    } ${errors.password ? 'text-red-400' : 'text-gray-400 hover:text-gray-600'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-12 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 bg-white focus:border-blue-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`text-lg transition-colors ${
                      showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'
                    } ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400 hover:text-gray-600'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Healthcare Terms Agreement */}
            <div>
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer ${
                    errors.agreeToTerms ? 'border-red-300' : ''
                  }`}
                />
                <div className="ml-3">
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <Link to="/healthcare-terms" className="text-blue-600 hover:text-blue-500 font-medium">
                      Healthcare Terms & Conditions
                    </Link>,{' '}
                    <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-500 font-medium">
                      Privacy Policy
                    </Link>, and{' '}
                    <Link to="/hipaa-agreement" className="text-blue-600 hover:text-blue-500 font-medium">
                      HIPAA Agreement
                    </Link>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Create Healthcare Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Creating Healthcare Account...
                </>
              ) : (
                <>
                  <i className="ri-user-heart-line mr-2"></i>
                  Create Healthcare Account
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or register with</span>
              </div>
            </div>

            {/* Google Healthcare Sign Up */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Register with Google for Healthcare
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already registered in our healthcare system?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </form>

          {/* Healthcare Security Trust Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <i className="ri-shield-check-line mr-1"></i>
                <span>Medical Grade SSL</span>
              </div>
              <div className="flex items-center">
                <i className="ri-lock-line mr-1"></i>
                <span>HIPAA Encryption</span>
              </div>
              <div className="flex items-center">
                <i className="ri-verified-badge-line mr-1"></i>
                <span>FDA Compliance</span>
              </div>
              <div className="flex items-center">
                <i className="ri-hospital-line mr-1"></i>
                <span>Hospital Integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}