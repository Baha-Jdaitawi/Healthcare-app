import express from 'express';
import { 
    getSpecializations,
    getSpecialization,
    createNewSpecialization,
    updateSpecializationData,
    removeSpecialization,
    addDoctorSpecializationData,
    removeDoctorSpecializationData,
    getDoctorSpecializationsData,
    updateDoctorSpecializationData,
    getDoctorsBySpecializationData,
    searchDoctorsBySpecialization
} from '../controllers/specializationController.js';
import { 
    authenticateToken, 
    requireRole,
    requireAdmin,
    requireDoctor 
} from '../middleware/auth.js';
import { 
    validateId,
    handleValidationErrors 
} from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation for specialization creation/update
const validateSpecialization = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Specialization name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors
];

// Validation for doctor specialization
const validateDoctorSpecialization = [
    body('specializationId')
        .isInt({ min: 1 })
        .withMessage('Valid specialization ID is required'),
    body('yearsExperience')
        .optional()
        .isInt({ min: 0, max: 60 })
        .withMessage('Years of experience must be between 0 and 60'),
    body('certification')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Certification cannot exceed 255 characters'),
    body('doctorId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid doctor ID is required'),
    handleValidationErrors
];

// Public routes - Get all specializations (no auth required for browsing)
router.get('/', getSpecializations);

// Get specific specialization
router.get('/:id', validateId, getSpecialization);

// Get doctors by specialization (public for patients to browse)
router.get('/:id/doctors', validateId, getDoctorsBySpecializationData);

// Search doctors by specialization name (public)
router.get('/search/doctors', searchDoctorsBySpecialization);

// Admin-only routes for managing specializations
router.post('/', 
    authenticateToken, 
    requireAdmin, 
    validateSpecialization, 
    createNewSpecialization
);

router.put('/:id', 
    authenticateToken, 
    requireAdmin, 
    validateId,
    validateSpecialization, 
    updateSpecializationData
);

router.delete('/:id', 
    authenticateToken, 
    requireAdmin, 
    validateId, 
    removeSpecialization
);

// Doctor routes for managing their specializations
router.post('/doctor/add', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateDoctorSpecialization, 
    addDoctorSpecializationData
);

router.delete('/doctor/:specializationId', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateId, 
    removeDoctorSpecializationData
);

router.put('/doctor/:specializationId', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateId,
    validateDoctorSpecialization, 
    updateDoctorSpecializationData
);

// Get doctor's specializations
router.get('/doctor/my-specializations', 
    authenticateToken, 
    requireDoctor,
    getDoctorSpecializationsData
);

// Get specific doctor's specializations (public for viewing doctor profiles)
router.get('/doctor/:doctorId/list', 
    validateId, 
    getDoctorSpecializationsData
);

// Bulk add specializations for doctor
router.post('/doctor/bulk-add', 
    authenticateToken, 
    requireDoctor,
    body('specializations')
        .isArray({ min: 1 })
        .withMessage('Specializations array is required'),
    body('specializations.*.specializationId')
        .isInt({ min: 1 })
        .withMessage('Valid specialization ID is required'),
    body('specializations.*.yearsExperience')
        .optional()
        .isInt({ min: 0, max: 60 })
        .withMessage('Years of experience must be between 0 and 60'),
    body('specializations.*.certification')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Certification cannot exceed 255 characters'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const doctorId = req.user.userId;
            const { specializations } = req.body;
            
            const addedSpecializations = [];
            
            for (const spec of specializations) {
                try {
                    const result = await addDoctorSpecializationData({
                        user: req.user,
                        body: {
                            specializationId: spec.specializationId,
                            yearsExperience: spec.yearsExperience,
                            certification: spec.certification
                        }
                    }, {
                        status: () => ({ json: (data) => data }),
                        json: (data) => data
                    });
                    addedSpecializations.push(result);
                } catch (error) {
                    console.error(`Error adding specialization ${spec.specializationId}:`, error);
                }
            }
            
            res.status(201).json({
                message: 'Specializations added successfully',
                addedSpecializations
            });
            
        } catch (error) {
            console.error('Bulk add specializations error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get popular specializations (most doctors)
router.get('/stats/popular', async (req, res) => {
    try {
        // This would return specializations ordered by number of doctors
        res.json({ 
            message: 'Popular specializations endpoint',
            note: 'Would return specializations with doctor counts'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specialization statistics (admin only)
router.get('/stats/admin', 
    authenticateToken, 
    requireAdmin, 
    async (req, res) => {
        try {
            // This would return detailed statistics about specializations
            res.json({ 
                message: 'Specialization statistics endpoint',
                note: 'Would return detailed stats for admin dashboard'
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;