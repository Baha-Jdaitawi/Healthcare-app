import pool from '../config/database.js';

// Create new document record
export const createDocument = async (documentData) => {
    const { patientId, uploadedBy, documentName, documentType, filePath, fileSize, description, isPublic } = documentData;
    const query = `
        INSERT INTO documents (patient_id, uploaded_by, document_name, document_type, file_path, file_size, description, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [patientId, uploadedBy, documentName, documentType, filePath, fileSize, description, isPublic || false];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get document by ID
export const getDocumentById = async (documentId) => {
    const query = `
        SELECT d.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users p ON d.patient_id = p.id
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.id = $1
    `;
    const result = await pool.query(query, [documentId]);
    return result.rows[0];
};

// Get all documents for a patient
export const getDocumentsByPatientId = async (patientId) => {
    const query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.patient_id = $1
        ORDER BY d.upload_date DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
};

// Get documents by type for a patient
export const getDocumentsByType = async (patientId, documentType) => {
    const query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.patient_id = $1 AND d.document_type = $2
        ORDER BY d.upload_date DESC
    `;
    const result = await pool.query(query, [patientId, documentType]);
    return result.rows;
};

// Get public documents for a user (like doctor's resume, certifications)
export const getPublicDocuments = async (userId) => {
    const query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.patient_id = $1 AND d.is_public = true
        ORDER BY d.upload_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Get doctor's resume (specific function for resumes)
export const getDoctorResume = async (doctorId) => {
    const query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.patient_id = $1 
        AND d.document_type = 'resume' 
        AND d.is_public = true
        ORDER BY d.upload_date DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows[0];
};

// Get doctor's certifications
export const getDoctorCertifications = async (doctorId) => {
    const query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE d.patient_id = $1 
        AND d.document_type = 'certification' 
        AND d.is_public = true
        ORDER BY d.upload_date DESC
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows;
};

// Upload resume for doctor
export const uploadDoctorResume = async (doctorId, documentData) => {
    const { documentName, filePath, fileSize, description } = documentData;
    
    // First, mark any existing resume as not current (optional - or we can replace)
    await pool.query(
        'UPDATE documents SET is_public = false WHERE patient_id = $1 AND document_type = $2',
        [doctorId, 'resume']
    );
    
    // Then create new resume
    const query = `
        INSERT INTO documents (patient_id, uploaded_by, document_name, document_type, file_path, file_size, description, is_public)
        VALUES ($1, $2, $3, 'resume', $4, $5, $6, true)
        RETURNING *
    `;
    const values = [doctorId, doctorId, documentName, filePath, fileSize, description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Upload certification for doctor
export const uploadDoctorCertification = async (doctorId, documentData) => {
    const { documentName, filePath, fileSize, description } = documentData;
    const query = `
        INSERT INTO documents (patient_id, uploaded_by, document_name, document_type, file_path, file_size, description, is_public)
        VALUES ($1, $2, $3, 'certification', $4, $5, $6, true)
        RETURNING *
    `;
    const values = [doctorId, doctorId, documentName, filePath, fileSize, description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Delete document
export const deleteDocument = async (documentId) => {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [documentId]);
    return result.rows[0];
};

// Update document description and public status
export const updateDocument = async (documentId, updateData) => {
    const { description, isPublic } = updateData;
    const query = `
        UPDATE documents 
        SET description = $1, is_public = $2
        WHERE id = $3
        RETURNING *
    `;
    const result = await pool.query(query, [description, isPublic, documentId]);
    return result.rows[0];
};

// Update document description only
export const updateDocumentDescription = async (documentId, description) => {
    const query = `
        UPDATE documents 
        SET description = $1
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [description, documentId]);
    return result.rows[0];
};

// Get all documents (for admin)
export const getAllDocuments = async () => {
    const query = `
        SELECT d.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users p ON d.patient_id = p.id
        JOIN users u ON d.uploaded_by = u.id
        ORDER BY d.upload_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Search documents by name or description
export const searchDocuments = async (patientId, searchTerm, userRole) => {
    let query = `
        SELECT d.*, 
               u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
        FROM documents d
        JOIN users u ON d.uploaded_by = u.id
        WHERE (d.document_name ILIKE $2 OR d.description ILIKE $2)
    `;
    
    let values = [];
    
    if (userRole === 'patient') {
        query += ' AND d.patient_id = $1';
        values = [patientId, `%${searchTerm}%`];
    } else {
        // For doctors/admin, they can search across patients they have access to
        query += ' AND (d.patient_id = $1 OR d.is_public = true)';
        values = [patientId, `%${searchTerm}%`];
    }
    
    query += ' ORDER BY d.upload_date DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
};

// Get document statistics
export const getDocumentStats = async (patientId, userRole) => {
    let query = `
        SELECT 
            COUNT(*) as total_documents,
            COUNT(CASE WHEN document_type = 'resume' THEN 1 END) as resumes,
            COUNT(CASE WHEN document_type = 'certification' THEN 1 END) as certifications,
            COUNT(CASE WHEN document_type = 'prescription' THEN 1 END) as prescriptions,
            COUNT(CASE WHEN document_type = 'lab_result' THEN 1 END) as lab_results,
            COUNT(CASE WHEN is_public = true THEN 1 END) as public_documents,
            COUNT(CASE WHEN upload_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_uploads
        FROM documents
        WHERE patient_id = $1
    `;
    
    if (userRole === 'patient') {
        // Patients see all their documents
    } else {
        // Doctors see public documents and documents they uploaded
        query += ' AND (is_public = true OR uploaded_by = $1)';
    }
    
    const result = await pool.query(query, [patientId]);
    return result.rows[0] || {
        total_documents: 0,
        resumes: 0,
        certifications: 0,
        prescriptions: 0,
        lab_results: 0,
        public_documents: 0,
        recent_uploads: 0
    };
};