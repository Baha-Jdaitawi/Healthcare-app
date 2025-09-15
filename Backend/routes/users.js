import express from 'express';
import { 
    getUserProfile,
    updateUserProfile,
    updatePatientProfileData,
    updateDoctorProfileData,
    getPatients,
    getDoctors,
    getDoctorDetails
} from '../controllers/userController.js';
import { 
    authenticateToken, 
    requireRole, 
    requireOwnership,
    requireAdmin,
    requireDoctor
} from '../middleware/auth.js';
import { 
    validatePatientProfile,
    validateDoctorProfile,
    validateId 
} from '../middleware/validation.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, getUserProfile);

// Get specific user profile (admin or self only)
router.get('/profile/:id', authenticateToken, validateId, getUserProfile);

// Update basic user info
router.put('/profile', authenticateToken, updateUserProfile);

// Update patient-specific profile
router.put('/patient-profile', 
    authenticateToken, 
    requireRole(['patient', 'admin']), 
    validatePatientProfile, 
    updatePatientProfileData
);

// Update doctor-specific profile
router.put('/doctor-profile', 
    authenticateToken, 
    requireRole(['doctor', 'admin']), 
    validateDoctorProfile, 
    updateDoctorProfileData
);

// Get all patients (for doctors and admin)
router.get('/patients', 
    authenticateToken, 
    requireRole(['doctor', 'admin']), 
    getPatients
);

// Get all doctors (public access for patients to see available doctors)
router.get('/doctors', getDoctors);

// Get specific doctor details
router.get('/doctors/:id', 
    validateId, 
    getDoctorDetails
);

// Admin routes for user management
router.get('/admin/users', 
    authenticateToken, 
    requireAdmin, 
    async (req, res) => {
        try {
            // This would be implemented in userController if needed
            res.json({ message: 'Admin user management endpoint' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get user statistics (admin only)
router.get('/admin/stats', 
    authenticateToken, 
    requireAdmin, 
    async (req, res) => {
        try {
            // This would return user statistics
            res.json({ message: 'User statistics endpoint' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;