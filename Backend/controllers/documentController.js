import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    createDocument,
    getDocumentById,
    getDocumentsByPatientId,
    getDocumentsByType,
    getPublicDocuments,
    getDoctorResume,
    getDoctorCertifications,
    uploadDoctorResume,
    uploadDoctorCertification,
    deleteDocument,
    updateDocument,
    updateDocumentDescription,
    getAllDocuments,
    searchDocuments,
    getDocumentStats
} from '../models/Document.js';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/documents/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
   
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 
    },
    fileFilter: fileFilter
});

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { patientId, documentType, description, isPublic } = req.body;
        const uploadedBy = req.user.userId;

       
        const finalPatientId = req.user.role === 'patient' ? req.user.userId : patientId;

        const documentData = {
            patientId: finalPatientId,
            uploadedBy,
            documentName: req.file.originalname,
            documentType,
            filePath: req.file.path,
            fileSize: req.file.size,
            description,
            isPublic: isPublic === 'true' || isPublic === true
        };

        const newDocument = await createDocument(documentData);

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: newDocument
        });

    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ message: 'Server error while uploading document' });
    }
};


export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No resume file uploaded' });
        }

        const doctorId = req.user.userId;
        const { description } = req.body;

      
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can upload resumes' });
        }

        const documentData = {
            documentName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            description: description || 'Doctor Resume/CV'
        };

        const newResume = await uploadDoctorResume(doctorId, documentData);

        res.status(201).json({
            message: 'Resume uploaded successfully',
            document: newResume
        });

    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ message: 'Server error while uploading resume' });
    }
};


export const uploadCertification = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No certification file uploaded' });
        }

        const doctorId = req.user.userId;
        const { description } = req.body;

        
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can upload certifications' });
        }

        const documentData = {
            documentName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            description: description || 'Medical Certification'
        };

        const newCertification = await uploadDoctorCertification(doctorId, documentData);

        res.status(201).json({
            message: 'Certification uploaded successfully',
            document: newCertification
        });

    } catch (error) {
        console.error('Upload certification error:', error);
        res.status(500).json({ message: 'Server error while uploading certification' });
    }
};


export const getDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const document = await getDocumentById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        
        const hasAccess = 
            userRole === 'admin' ||
            document.patient_id === userId ||
            document.uploaded_by === userId ||
            document.is_public;

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({
            message: 'Document retrieved successfully',
            document
        });

    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const downloadDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const document = await getDocumentById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        
        const hasAccess = 
            userRole === 'admin' ||
            document.patient_id === userId ||
            document.uploaded_by === userId ||
            document.is_public;

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

       
        if (!fs.existsSync(document.file_path)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(document.file_path, document.document_name);

    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getPatientDocuments = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.userId;
        const userId = req.user.userId;
        const userRole = req.user.role;

      
        if (userRole === 'patient' && parseInt(patientId) !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const documents = await getDocumentsByPatientId(patientId);

        res.json({
            message: 'Documents retrieved successfully',
            documents
        });

    } catch (error) {
        console.error('Get patient documents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getPublicDocumentsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const documents = await getPublicDocuments(userId);

        res.json({
            message: 'Public documents retrieved successfully',
            documents
        });

    } catch (error) {
        console.error('Get public documents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDoctorResumeData = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        const resume = await getDoctorResume(doctorId);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found for this doctor' });
        }

        res.json({
            message: 'Doctor resume retrieved successfully',
            resume
        });

    } catch (error) {
        console.error('Get doctor resume error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDoctorCertificationsData = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        const certifications = await getDoctorCertifications(doctorId);

        res.json({
            message: 'Doctor certifications retrieved successfully',
            certifications
        });

    } catch (error) {
        console.error('Get doctor certifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDocumentsByDocType = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user.userId;
        const documentType = req.params.type;
        const userId = req.user.userId;
        const userRole = req.user.role;

        
        if (userRole === 'patient' && parseInt(patientId) !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const documents = await getDocumentsByType(patientId, documentType);

        res.json({
            message: 'Documents retrieved successfully',
            documents
        });

    } catch (error) {
        console.error('Get documents by type error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateDocumentData = async (req, res) => {
    try {
        const documentId = req.params.id;
        const { description, isPublic } = req.body;
        const userId = req.user.userId;

        const document = await getDocumentById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

       
        if (document.uploaded_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedDocument = await updateDocument(documentId, { description, isPublic });

        res.json({
            message: 'Document updated successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const removeDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.userId;

        const document = await getDocumentById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

       
        if (document.uploaded_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

      
        await deleteDocument(documentId);

        res.json({
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const searchDocumentsData = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!searchTerm) {
            return res.status(400).json({ message: 'Search term is required' });
        }

        const documents = await searchDocuments(userId, searchTerm, userRole);

        res.json({
            message: 'Document search completed successfully',
            documents,
            searchTerm
        });

    } catch (error) {
        console.error('Search documents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDocumentStatistics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        const stats = await getDocumentStats(userId, userRole);

        res.json({
            message: 'Document statistics retrieved successfully',
            stats
        });

    } catch (error) {
        console.error('Get document statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};