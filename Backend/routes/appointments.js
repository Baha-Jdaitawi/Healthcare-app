import express from 'express';
import { body } from 'express-validator';
import { 
    bookAppointment,
    getAppointment,
    getMyAppointments,
    getPatientAppointments,
    updateAppointment,
    addNotes
} from '../controllers/appointmentController.js';
import { 
    authenticateToken, 
    requireRole, 
    requireDoctor,
    requirePatient
} from '../middleware/auth.js';
import { 
    validateAppointment,
    validateAppointmentStatus,
    validateConsultationNotes,
    validateId 
} from '../middleware/validation.js';

const router = express.Router();

// Book new appointment (patients only)
router.post('/', 
    authenticateToken, 
    requirePatient,
    validateAppointment, 
    bookAppointment
);

// Get specific appointment details
router.get('/:id', 
    authenticateToken, 
    validateId, 
    getAppointment
);

// Get current user's appointments
router.get('/', 
    authenticateToken, 
    getMyAppointments
);

// Get appointments for a specific patient (doctors and admin only)
router.get('/patient/:patientId', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateId, 
    getPatientAppointments
);

// Update appointment status
router.put('/:id/status', 
    authenticateToken, 
    validateId,
    validateAppointmentStatus, 
    updateAppointment
);

// Add consultation notes (doctors only)
router.put('/:id/notes', 
    authenticateToken, 
    requireDoctor,
    validateId,
    validateConsultationNotes, 
    addNotes
);

// Get upcoming appointments (patients and doctors)
router.get('/upcoming/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            
            // This would filter appointments by date >= today
            // Implementation would be similar to getMyAppointments but with date filter
            res.json({ 
                message: 'Upcoming appointments endpoint',
                userId,
                userRole 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get past appointments (patients and doctors)
router.get('/past/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            
            // This would filter appointments by date < today
            res.json({ 
                message: 'Past appointments endpoint',
                userId,
                userRole 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get today's appointments (doctors)
router.get('/today/list', 
    authenticateToken, 
    requireDoctor,
    async (req, res) => {
        try {
            const doctorId = req.user.userId;
            
            // This would filter appointments by today's date
            res.json({ 
                message: 'Today\'s appointments endpoint',
                doctorId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Cancel appointment
router.put('/:id/cancel', 
    authenticateToken, 
    validateId,
    async (req, res) => {
        try {
            // This would update appointment status to 'cancelled'
            // Can be done by patient or doctor
            res.json({ 
                message: 'Cancel appointment endpoint',
                appointmentId: req.params.id,
                userId: req.user.userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Reschedule appointment
router.put('/:id/reschedule', 
    authenticateToken, 
    validateId,
    body('newDate').isISO8601().toDate().withMessage('Valid new date is required'),
    body('newTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid new time is required'),
    async (req, res) => {
        try {
            const { newDate, newTime } = req.body;
            
            // This would update appointment date and time
            res.json({ 
                message: 'Reschedule appointment endpoint',
                appointmentId: req.params.id,
                newDate,
                newTime 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;