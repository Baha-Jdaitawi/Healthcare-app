import pool from '../config/database.js';

// Create new appointment
export const createAppointment = async (appointmentData) => {
    const { patientId, doctorId, appointmentDate, appointmentTime, reasonForVisit, consultationFee } = appointmentData;
    const query = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason_for_visit, consultation_fee)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [patientId, doctorId, appointmentDate, appointmentTime, reasonForVisit, consultationFee];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
    const query = `
        SELECT a.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email,
               d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.email as doctor_email,
               dp.specialization
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users d ON a.doctor_id = d.id
        LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
        WHERE a.id = $1
    `;
    const result = await pool.query(query, [appointmentId]);
    return result.rows[0];
};

// Get appointments by patient ID
export const getAppointmentsByPatientId = async (patientId) => {
    const query = `
        SELECT a.*, 
               d.first_name as doctor_first_name, d.last_name as doctor_last_name,
               dp.specialization
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
};

// Get appointments by doctor ID
export const getAppointmentsByDoctorId = async (doctorId) => {
    const query = `
        SELECT a.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows;
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
    const query = `
        UPDATE appointments 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [status, appointmentId]);
    return result.rows[0];
};

// Add consultation notes
export const addConsultationNotes = async (appointmentId, notes) => {
    const query = `
        UPDATE appointments 
        SET consultation_notes = $1, status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [notes, appointmentId]);
    return result.rows[0];
};