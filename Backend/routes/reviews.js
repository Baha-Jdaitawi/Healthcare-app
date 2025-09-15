import express from 'express';
import { 
    addReview,
    getReview,
    getDoctorReviews,
    getMyReviews,
    updateReviewData,
    removeReview,
    getDoctorStats,
    addReviewResponse,
    updateReviewResponseData,
    removeReviewResponse,
    getRecentReviewsData,
    getTopRatedDoctorsData,
    canReviewDoctor
} from '../controllers/reviewController.js';
import { 
    authenticateToken, 
    requireRole,
    requireDoctor,
    requirePatient 
} from '../middleware/auth.js';
import { 
    validateId,
    handleValidationErrors 
} from '../middleware/validation.js';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation for review creation/update
const validateReview = [
    body('doctorId')
        .isInt({ min: 1 })
        .withMessage('Valid doctor ID is required'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('reviewText')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Review text cannot exceed 1000 characters'),
    body('appointmentId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid appointment ID is required'),
    handleValidationErrors
];

// Validation for review response
const validateReviewResponse = [
    body('responseText')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Response text must be between 10 and 1000 characters'),
    handleValidationErrors
];

// Validation for pagination
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
];

// Create new review (patients only)
router.post('/', 
    authenticateToken, 
    requirePatient,
    validateReview, 
    addReview
);

// Get specific review
router.get('/:id', 
    validateId, 
    getReview
);

// Get reviews for a doctor (public access)
router.get('/doctor/:doctorId', 
    validateId,
    validatePagination,
    getDoctorReviews
);

// Get doctor's rating statistics (public access)
router.get('/doctor/:doctorId/stats', 
    validateId, 
    getDoctorStats
);

// Get current patient's reviews
router.get('/patient/my-reviews', 
    authenticateToken, 
    requirePatient,
    getMyReviews
);

// Update review (patients only, their own reviews)
router.put('/:id', 
    authenticateToken, 
    requirePatient,
    validateId,
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('reviewText')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Review text cannot exceed 1000 characters'),
    handleValidationErrors,
    updateReviewData
);

// Delete review (patients only, their own reviews)
router.delete('/:id', 
    authenticateToken, 
    requirePatient,
    validateId, 
    removeReview
);

// Add response to review (doctors only)
router.post('/:id/response', 
    authenticateToken, 
    requireDoctor,
    validateId,
    validateReviewResponse, 
    addReviewResponse
);

// Update review response (doctors only)
router.put('/:id/response', 
    authenticateToken, 
    requireDoctor,
    validateId,
    validateReviewResponse, 
    updateReviewResponseData
);

// Delete review response (doctors only)
router.delete('/:id/response', 
    authenticateToken, 
    requireDoctor,
    validateId, 
    removeReviewResponse
);

// Check if patient can review doctor
router.get('/can-review/:doctorId', 
    authenticateToken, 
    requirePatient,
    validateId, 
    canReviewDoctor
);

// Get recent reviews (public)
router.get('/recent/list', 
    query('limit')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Limit must be between 1 and 20'),
    handleValidationErrors,
    getRecentReviewsData
);

// Get top rated doctors (public)
router.get('/top-rated/doctors', 
    query('limit')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Limit must be between 1 and 20'),
    handleValidationErrors,
    getTopRatedDoctorsData
);

// Get reviews by rating for a doctor
router.get('/doctor/:doctorId/rating/:rating', 
    validateId,
    validatePagination,
    async (req, res) => {
        try {
            const { doctorId, rating } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // This would filter reviews by specific rating
            res.json({ 
                message: 'Reviews by rating endpoint',
                doctorId,
                rating,
                page,
                limit
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get review statistics for all doctors (admin dashboard)
router.get('/stats/overview', 
    authenticateToken, 
    requireRole(['admin']),
    async (req, res) => {
        try {
            // This would return overall review statistics
            res.json({ 
                message: 'Review statistics overview endpoint',
                note: 'Would return total reviews, average ratings, etc.'
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Search reviews by content
router.get('/search/content', 
    query('searchTerm')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Search term must be at least 3 characters'),
    validatePagination,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { searchTerm } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // This would search reviews by text content
            res.json({ 
                message: 'Search reviews endpoint',
                searchTerm,
                page,
                limit
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get helpful reviews (most liked or featured)
router.get('/helpful/featured', 
    validatePagination,
    async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            
            // This would return most helpful/featured reviews
            res.json({ 
                message: 'Helpful reviews endpoint',
                limit
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;