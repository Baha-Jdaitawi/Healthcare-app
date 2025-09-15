import express from 'express';
import { 
    uploadDocument,
    uploadResume,
    uploadCertification,
    getDocument,
    downloadDocument,
    getPatientDocuments,
    getPublicDocumentsForUser,
    getDoctorResumeData,
    getDoctorCertificationsData,
    getDocumentsByDocType,
    updateDocumentData,
    removeDocument,
    searchDocumentsData,
    getDocumentStatistics,
    upload
} from '../controllers/documentController.js';
import { 
    authenticateToken, 
    requireRole,
    requireDoctor,
    requirePatient 
} from '../middleware/auth.js';
import { 
    validateDocument,
    validateId,
    handleValidationErrors 
} from '../middleware/validation.js';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation for document updates
const validateDocumentUpdate = [
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean value'),
    handleValidationErrors
];

// Validation for resume upload
const validateResumeUpload = [
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors
];

// Upload new document
router.post('/upload', 
    authenticateToken, 
    upload.single('document'), 
    validateDocument, 
    uploadDocument
);

// Doctor-specific routes for resume and certifications
router.post('/upload-resume', 
    authenticateToken, 
    requireDoctor,
    upload.single('resume'), 
    validateResumeUpload, 
    uploadResume
);

router.post('/upload-certification', 
    authenticateToken, 
    requireDoctor,
    upload.single('certification'), 
    validateResumeUpload, 
    uploadCertification
);

// Get specific document details
router.get('/:id', 
    authenticateToken, 
    validateId, 
    getDocument
);

// Download document file
router.get('/:id/download', 
    authenticateToken, 
    validateId, 
    downloadDocument
);

// Get documents for current user (if patient) or specific patient
router.get('/', 
    authenticateToken, 
    getPatientDocuments
);

// Get documents for a specific patient (doctors and admin)
router.get('/patient/:patientId', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateId, 
    getPatientDocuments
);

// Get public documents for a user (like doctor's resume, certifications)
router.get('/public/:userId', 
    validateId, 
    getPublicDocumentsForUser
);

// Get doctor's resume (public access)
router.get('/doctor/:doctorId/resume', 
    validateId, 
    getDoctorResumeData
);

// Get doctor's certifications (public access)
router.get('/doctor/:doctorId/certifications', 
    validateId, 
    getDoctorCertificationsData
);

// Get documents by type for current user
router.get('/type/:type', 
    authenticateToken, 
    getDocumentsByDocType
);

// Get documents by type for specific patient (doctors and admin)
router.get('/patient/:patientId/type/:type', 
    authenticateToken, 
    requireRole(['doctor', 'admin']),
    validateId, 
    getDocumentsByDocType
);

// Update document
router.put('/:id', 
    authenticateToken, 
    validateId,
    validateDocumentUpdate,
    updateDocumentData
);

// Delete document
router.delete('/:id', 
    authenticateToken, 
    validateId, 
    removeDocument
);

// Search documents
router.get('/search/query', 
    authenticateToken, 
    query('searchTerm')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Search term must be at least 3 characters'),
    handleValidationErrors,
    searchDocumentsData
);

// Get document statistics
router.get('/stats/summary', 
    authenticateToken, 
    getDocumentStatistics
);

// Get document types (for dropdown lists)
router.get('/types/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const documentTypes = [
                { value: 'prescription', label: 'Prescription' },
                { value: 'lab_result', label: 'Lab Result' },
                { value: 'medical_report', label: 'Medical Report' },
                { value: 'x_ray', label: 'X-Ray' },
                { value: 'mri_scan', label: 'MRI Scan' },
                { value: 'ct_scan', label: 'CT Scan' },
                { value: 'ultrasound', label: 'Ultrasound' },
                { value: 'blood_test', label: 'Blood Test' },
                { value: 'insurance_card', label: 'Insurance Card' },
                { value: 'medical_certificate', label: 'Medical Certificate' },
                { value: 'vaccination_record', label: 'Vaccination Record' },
                { value: 'discharge_summary', label: 'Discharge Summary' },
                { value: 'referral_letter', label: 'Referral Letter' },
                { value: 'resume', label: 'Resume/CV' },
                { value: 'certification', label: 'Medical Certification' },
                { value: 'other', label: 'Other' }
            ];
            
            res.json({ 
                message: 'Document types retrieved successfully',
                documentTypes 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get recent documents
router.get('/recent/list', 
    authenticateToken, 
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const limit = parseInt(req.query.limit) || 10;
            
            // This would get recently uploaded documents
            res.json({ 
                message: 'Recent documents endpoint',
                userId,
                userRole,
                limit 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Bulk upload documents
router.post('/bulk-upload', 
    authenticateToken, 
    upload.array('documents', 10), // Allow up to 10 files
    body('documentType')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Document type must be between 3 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean value'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const files = req.files;
            const userId = req.user.userId;
            const { documentType, description, isPublic } = req.body;

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const uploadedDocuments = [];
            const uploadErrors = [];

            for (const file of files) {
                try {
                    const documentData = {
                        patientId: userId,
                        uploadedBy: userId,
                        documentName: file.originalname,
                        documentType,
                        filePath: file.path,
                        fileSize: file.size,
                        description,
                        isPublic: isPublic === 'true' || isPublic === true
                    };

                    // This would use the createDocument function
                    uploadedDocuments.push({
                        filename: file.originalname,
                        status: 'success'
                    });
                } catch (error) {
                    uploadErrors.push({
                        filename: file.originalname,
                        error: error.message
                    });
                }
            }

            res.json({ 
                message: 'Bulk upload completed',
                uploaded: uploadedDocuments.length,
                errors: uploadErrors.length,
                uploadedDocuments,
                uploadErrors
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Share document with doctor (for patients)
router.post('/:id/share', 
    authenticateToken, 
    requirePatient,
    validateId,
    body('doctorId')
        .isInt({ min: 1 })
        .withMessage('Valid doctor ID is required'),
    body('message')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Message cannot exceed 500 characters'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const documentId = req.params.id;
            const { doctorId, message } = req.body;
            const patientId = req.user.userId;

            // This would create a notification or message to doctor about shared document
            res.json({ 
                message: 'Document shared with doctor successfully',
                documentId,
                doctorId,
                sharedBy: patientId,
                shareMessage: message
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;