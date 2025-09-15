// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SIGNUP: '/signup'
};

// Patient Routes
export const PATIENT_ROUTES = {
  DASHBOARD: '/patient-dashboard',
  PROFILE: '/patient/profile',
  PROFILE_ALT: '/profile', 
  APPOINTMENTS: '/appointments',
  BOOK_APPOINTMENT: '/book-appointment',
  BOOK_APPOINTMENT_WITH_DOCTOR: '/book-appointment/:doctorId',
  DOCUMENTS: '/documents',
  DOCTORS: '/doctors',
  DOCTOR_PROFILE: '/doctor/:doctorId'
};

// Doctor Routes
export const DOCTOR_ROUTES = {
  DASHBOARD: '/doctor-dashboard',
  PROFILE: '/doctor/profile',
  APPOINTMENTS: '/appointments', 
  DOCUMENTS: '/documents', 
  SCHEDULE: '/doctor/schedule',
  PATIENTS: '/doctor/patients',
  REVIEWS: '/doctor/reviews'
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin-dashboard',
  DASHBOARD_ALT: '/admin', // 
  DOCTORS: '/admin/doctors',
  PATIENTS: '/admin/patients',
  SPECIALIZATIONS: '/admin/specializations',
  REVIEWS: '/admin/reviews',
  DOCUMENTS: '/admin/documents',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings'
};

// Shared Routes (accessible by multiple roles)
export const SHARED_ROUTES = {
  APPOINTMENTS: '/appointments',
  DOCUMENTS: '/documents'
};

// Auth Callback Routes
export const AUTH_ROUTES = {
  GOOGLE_CALLBACK: '/auth/google/callback',
  GOOGLE_SUCCESS: '/auth/google/success',
  GOOGLE_FAILURE: '/auth/google/failure',
  AUTH_ERROR: '/auth/error'
};

// Error Routes
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/500'
};

// Route Patterns (for dynamic routes)
export const ROUTE_PATTERNS = {
  DOCTOR_PROFILE: '/doctor/:doctorId',
  PATIENT_PROFILE: '/patient/:patientId',
  APPOINTMENT_DETAILS: '/appointments/:appointmentId',
  DOCUMENT_VIEW: '/documents/:documentId',
  BOOK_APPOINTMENT_WITH_DOCTOR: '/book-appointment/:doctorId'
};

// Route Groups by Role
export const ROUTES_BY_ROLE = {
  patient: [
    PATIENT_ROUTES.DASHBOARD,
    PATIENT_ROUTES.PROFILE,
    PATIENT_ROUTES.PROFILE_ALT,
    PATIENT_ROUTES.APPOINTMENTS,
    PATIENT_ROUTES.BOOK_APPOINTMENT,
    PATIENT_ROUTES.DOCUMENTS,
    PATIENT_ROUTES.DOCTORS,
    PATIENT_ROUTES.DOCTOR_PROFILE
  ],
  doctor: [
    DOCTOR_ROUTES.DASHBOARD,
    DOCTOR_ROUTES.PROFILE,
    DOCTOR_ROUTES.APPOINTMENTS,
    DOCTOR_ROUTES.DOCUMENTS,
    DOCTOR_ROUTES.SCHEDULE,
    DOCTOR_ROUTES.PATIENTS,
    DOCTOR_ROUTES.REVIEWS
  ],
  admin: [
    ADMIN_ROUTES.DASHBOARD,
    ADMIN_ROUTES.DASHBOARD_ALT,
    ADMIN_ROUTES.DOCTORS,
    ADMIN_ROUTES.PATIENTS,
    ADMIN_ROUTES.SPECIALIZATIONS,
    ADMIN_ROUTES.REVIEWS,
    ADMIN_ROUTES.DOCUMENTS,
    ADMIN_ROUTES.ANALYTICS,
    ADMIN_ROUTES.SETTINGS
  ]
};

// Navigation Menu Items by Role
export const NAVIGATION_ITEMS = {
  patient: [
    { path: PATIENT_ROUTES.DASHBOARD, label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: PATIENT_ROUTES.APPOINTMENTS, label: 'Appointments', icon: 'ri-calendar-line' },
    { path: PATIENT_ROUTES.DOCTORS, label: 'Find Doctors', icon: 'ri-user-heart-line' },
    { path: PATIENT_ROUTES.DOCUMENTS, label: 'Documents', icon: 'ri-file-text-line' },
    { path: PATIENT_ROUTES.PROFILE, label: 'Profile', icon: 'ri-user-line' }
  ],
  doctor: [
    { path: DOCTOR_ROUTES.DASHBOARD, label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: DOCTOR_ROUTES.APPOINTMENTS, label: 'Appointments', icon: 'ri-calendar-line' },
    { path: DOCTOR_ROUTES.PATIENTS, label: 'Patients', icon: 'ri-user-line' },
    { path: DOCTOR_ROUTES.DOCUMENTS, label: 'Documents', icon: 'ri-file-text-line' },
    { path: DOCTOR_ROUTES.REVIEWS, label: 'Reviews', icon: 'ri-star-line' },
    { path: DOCTOR_ROUTES.PROFILE, label: 'Profile', icon: 'ri-user-settings-line' }
  ],
  admin: [
    { path: ADMIN_ROUTES.DASHBOARD, label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: ADMIN_ROUTES.DOCTORS, label: 'Doctors', icon: 'ri-user-heart-line' },
    { path: ADMIN_ROUTES.PATIENTS, label: 'Patients', icon: 'ri-user-line' },
    { path: ADMIN_ROUTES.SPECIALIZATIONS, label: 'Specializations', icon: 'ri-stethoscope-line' },
    { path: ADMIN_ROUTES.REVIEWS, label: 'Reviews', icon: 'ri-star-line' },
    { path: ADMIN_ROUTES.DOCUMENTS, label: 'Documents', icon: 'ri-file-text-line' },
    { path: ADMIN_ROUTES.ANALYTICS, label: 'Analytics', icon: 'ri-bar-chart-line' },
    { path: ADMIN_ROUTES.SETTINGS, label: 'Settings', icon: 'ri-settings-line' }
  ]
};

// Route Utilities
export const getRouteByRole = (role) => {
  return ROUTES_BY_ROLE[role] || [];
};

export const getNavigationItems = (role) => {
  return NAVIGATION_ITEMS[role] || [];
};

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'patient':
      return PATIENT_ROUTES.DASHBOARD;
    case 'doctor':
      return DOCTOR_ROUTES.DASHBOARD;
    case 'admin':
      return ADMIN_ROUTES.DASHBOARD;
    default:
      return PUBLIC_ROUTES.HOME;
  }
};

export const isPublicRoute = (pathname) => {
  return Object.values(PUBLIC_ROUTES).includes(pathname);
};

export const isProtectedRoute = (pathname) => {
  return !isPublicRoute(pathname) && !Object.values(AUTH_ROUTES).includes(pathname);
};

export const getRoutePermissions = (pathname) => {
  // Check which roles can access this route
  const allowedRoles = [];
  
  Object.entries(ROUTES_BY_ROLE).forEach(([role, routes]) => {
    if (routes.some(route => {
      // Handle dynamic routes
      if (route.includes(':')) {
        const pattern = route.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(pathname);
      }
      return route === pathname;
    })) {
      allowedRoles.push(role);
    }
  });
  
  return allowedRoles;
};

// Generate dynamic route paths
export const generateRoute = (pattern, params) => {
  let route = pattern;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};

// Common route generation helpers
export const getDoctorProfileRoute = (doctorId) => 
  generateRoute(ROUTE_PATTERNS.DOCTOR_PROFILE, { doctorId });

export const getBookAppointmentRoute = (doctorId) => 
  generateRoute(ROUTE_PATTERNS.BOOK_APPOINTMENT_WITH_DOCTOR, { doctorId });

export const getAppointmentDetailsRoute = (appointmentId) => 
  generateRoute(ROUTE_PATTERNS.APPOINTMENT_DETAILS, { appointmentId });

export const getDocumentViewRoute = (documentId) => 
  generateRoute(ROUTE_PATTERNS.DOCUMENT_VIEW, { documentId });


export const getBreadcrumbs = (pathname, role) => {
  const breadcrumbs = [
    { label: 'Home', path: getDashboardRoute(role) }
  ];

  
  if (pathname.includes('/appointments')) {
    breadcrumbs.push({ label: 'Appointments', path: SHARED_ROUTES.APPOINTMENTS });
  }
  
  if (pathname.includes('/documents')) {
    breadcrumbs.push({ label: 'Documents', path: SHARED_ROUTES.DOCUMENTS });
  }
  
  if (pathname.includes('/doctors')) {
    breadcrumbs.push({ label: 'Find Doctors', path: PATIENT_ROUTES.DOCTORS });
  }
  
  if (pathname.includes('/book-appointment')) {
    breadcrumbs.push({ label: 'Book Appointment', path: PATIENT_ROUTES.BOOK_APPOINTMENT });
  }

  return breadcrumbs;
};