// Healthcare App Constants

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

// Appointment Types
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  EMERGENCY: 'emergency',
  CHECK_UP: 'check-up',
  SCREENING: 'screening',
  THERAPY: 'therapy'
};

// Document Types
export const DOCUMENT_TYPES = {
  PRESCRIPTION: 'prescription',
  LAB_RESULTS: 'lab-results',
  X_RAY: 'x-ray',
  MRI: 'mri',
  CT_SCAN: 'ct-scan',
  REPORT: 'report',
  INSURANCE: 'insurance',
  MEDICAL_HISTORY: 'medical-history',
  VACCINATION_RECORD: 'vaccination-record',
  DISCHARGE_SUMMARY: 'discharge-summary',
  REFERRAL: 'referral',
  OTHER: 'other'
};

// Document Status
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived'
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

// Doctor Verification Status
export const DOCTOR_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// User Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Medical Specializations (common ones)
export const MEDICAL_SPECIALIZATIONS = {
  CARDIOLOGY: 'Cardiology',
  DERMATOLOGY: 'Dermatology',
  EMERGENCY_MEDICINE: 'Emergency Medicine',
  FAMILY_MEDICINE: 'Family Medicine',
  GASTROENTEROLOGY: 'Gastroenterology',
  GENERAL_SURGERY: 'General Surgery',
  INTERNAL_MEDICINE: 'Internal Medicine',
  NEUROLOGY: 'Neurology',
  OBSTETRICS_GYNECOLOGY: 'Obstetrics & Gynecology',
  ONCOLOGY: 'Oncology',
  ORTHOPEDICS: 'Orthopedics',
  PEDIATRICS: 'Pediatrics',
  PSYCHIATRY: 'Psychiatry',
  RADIOLOGY: 'Radiology',
  UROLOGY: 'Urology',
  OPHTHALMOLOGY: 'Ophthalmology',
  ENT: 'Ear, Nose & Throat',
  ANESTHESIOLOGY: 'Anesthesiology',
  PATHOLOGY: 'Pathology',
  REHABILITATION: 'Rehabilitation Medicine'
};

// Time Slots (for appointment booking)
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
];

// Days of the Week
export const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

// Gender Options
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer-not-to-say'
};

// Blood Types
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
];

// Marital Status
export const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  SEPARATED: 'separated'
};

// Emergency Contact Relationships
export const EMERGENCY_RELATIONSHIPS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 
  'Guardian', 'Other Family Member', 'Colleague', 'Other'
];

// Insurance Providers (common ones)
export const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealth',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'Other'
];

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  LARGE_PAGE_SIZE: 25,
  SMALL_PAGE_SIZE: 5
};

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle'
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_DATE: 'Please enter a valid date',
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported format.',
  FUTURE_DATE_NOT_ALLOWED: 'Future dates are not allowed',
  PAST_DATE_NOT_ALLOWED: 'Past dates are not allowed'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'healthcare_auth_token',
  USER_DATA: 'healthcare_user_data',
  THEME_PREFERENCE: 'healthcare_theme',
  LANGUAGE_PREFERENCE: 'healthcare_language',
  REMEMBER_ME: 'healthcare_remember_me'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  LONG: 'EEEE, MMMM dd, yyyy',
  SHORT: 'MM/dd/yyyy',
  TIME: 'HH:mm',
  TIME_12: 'h:mm a',
  DATETIME: 'MMM dd, yyyy h:mm a'
};

// Rating Scale
export const RATING_SCALE = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3
};

// Search Filters
export const SEARCH_FILTERS = {
  DOCTORS: {
    SPECIALIZATION: 'specialization',
    LOCATION: 'location',
    RATING: 'rating',
    AVAILABILITY: 'availability',
    EXPERIENCE: 'experience',
    CONSULTATION_FEE: 'consultation_fee'
  },
  APPOINTMENTS: {
    STATUS: 'status',
    DATE_RANGE: 'date_range',
    DOCTOR: 'doctor',
    TYPE: 'type'
  },
  DOCUMENTS: {
    TYPE: 'type',
    DATE_RANGE: 'date_range',
    STATUS: 'status',
    PATIENT: 'patient'
  }
};

// Feature Flags (for conditional features)
export const FEATURES = {
  VIDEO_CALLS: true,
  ONLINE_PAYMENTS: true,
  CHAT_SUPPORT: false,
  MULTI_LANGUAGE: false,
  DARK_MODE: false,
  NOTIFICATIONS: true,
  GOOGLE_AUTH: true,
  APPOINTMENT_REMINDERS: true
};

// Default Values
export const DEFAULTS = {
  APPOINTMENT_DURATION: 30, // minutes
  CONSULTATION_FEE: 150, // dollars
  PROFILE_PICTURE: '/assets/default-avatar.png',
  PAGE_SIZE: PAGINATION.DEFAULT_PAGE_SIZE,
  LANGUAGE: 'en',
  TIMEZONE: 'America/New_York'
};

// URL Patterns
export const URL_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  LICENSE_NUMBER: /^[A-Z0-9\-]{6,20}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/
};

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT'
};

// Export all constants as a grouped object for easy importing
export const HEALTHCARE_CONSTANTS = {
  USER_ROLES,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPES,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  REVIEW_STATUS,
  DOCTOR_VERIFICATION_STATUS,
  ACCOUNT_STATUS,
  PAYMENT_STATUS,
  MEDICAL_SPECIALIZATIONS,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  GENDER_OPTIONS,
  BLOOD_TYPES,
  MARITAL_STATUS,
  EMERGENCY_RELATIONSHIPS,
  INSURANCE_PROVIDERS,
  FILE_UPLOAD,
  PAGINATION,
  API_STATUS,
  VALIDATION_MESSAGES,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  DATE_FORMATS,
  RATING_SCALE,
  SEARCH_FILTERS,
  FEATURES,
  DEFAULTS,
  URL_PATTERNS,
  ERROR_CODES
};