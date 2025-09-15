import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const validateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('role')
        .isIn(['patient', 'doctor'])
        .withMessage('Role must be either patient or doctor'),
    handleValidationErrors
];

// User login validation
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Appointment booking validation
export const validateAppointment = [
    body('doctorId')
        .isInt({ min: 1 })
        .withMessage('Valid doctor ID is required'),
    body('appointmentDate')
        .isISO8601()
        .toDate()
        .withMessage('Valid appointment date is required'),
    body('appointmentTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid appointment time is required (HH:MM format)'),
    body('reasonForVisit')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Reason for visit must be between 5 and 500 characters'),
    body('consultationFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a positive number'),
    handleValidationErrors
];

// Message validation
export const validateMessage = [
    body('receiverId')
        .isInt({ min: 1 })
        .withMessage('Valid receiver ID is required'),
    body('subject')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Subject must be between 3 and 200 characters'),
    body('messageContent')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message content must be between 10 and 2000 characters'),
    handleValidationErrors
];

// Document upload validation
export const validateDocument = [
    body('documentType')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Document type must be between 3 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('patientId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid patient ID is required'),
    handleValidationErrors
];

// Patient profile validation
export const validatePatientProfile = [
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Valid date of birth is required'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),
    body('emergencyContact')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Emergency contact must be between 2 and 100 characters'),
    body('emergencyPhone')
        .optional()
        .isMobilePhone()
        .withMessage('Valid emergency phone number is required'),
    body('medicalConditions')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Medical conditions cannot exceed 1000 characters'),
    body('allergies')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Allergies cannot exceed 1000 characters'),
    body('bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood type'),
    handleValidationErrors
];

// Doctor profile validation
export const validateDoctorProfile = [
    body('specialization')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Specialization must be between 3 and 100 characters'),
    body('licenseNumber')
        .optional()
        .trim()
        .isLength({ min: 5, max: 50 })
        .withMessage('License number must be between 5 and 50 characters'),
    body('yearsExperience')
        .optional()
        .isInt({ min: 0, max: 60 })
        .withMessage('Years of experience must be between 0 and 60'),
    body('consultationFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a positive number'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Bio cannot exceed 2000 characters'),
    handleValidationErrors
];

// Update appointment status validation
export const validateAppointmentStatus = [
    body('status')
        .isIn(['scheduled', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Status must be scheduled, confirmed, completed, or cancelled'),
    handleValidationErrors
];

// Add consultation notes validation
export const validateConsultationNotes = [
    body('notes')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Consultation notes must be between 10 and 2000 characters'),
    handleValidationErrors
];

// ID parameter validation
export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required'),
    handleValidationErrors
];

// Pagination validation
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];