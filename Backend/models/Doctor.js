import pool from '../config/database.js';

// Create doctor profile
export const createDoctorProfile = async (profileData) => {
    const { userId, licenseNumber, yearsExperience, consultationFee, bio, availabilityHours } = profileData;
    const query = `
        INSERT INTO doctor_profiles (user_id, license_number, years_experience, consultation_fee, bio, availability_hours)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [userId, licenseNumber, yearsExperience, consultationFee, bio, availabilityHours];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get doctor profile by user ID
export const getDoctorProfileByUserId = async (userId) => {
    const query = 'SELECT * FROM doctor_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

// Update doctor profile
export const updateDoctorProfile = async (userId, profileData) => {
    const { licenseNumber, yearsExperience, consultationFee, bio, availabilityHours } = profileData;
    const query = `
        UPDATE doctor_profiles 
        SET license_number = $1, years_experience = $2, consultation_fee = $3, 
            bio = $4, availability_hours = $5
        WHERE user_id = $6
        RETURNING *
    `;
    const values = [licenseNumber, yearsExperience, consultationFee, bio, availabilityHours, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get all doctors with their specializations
export const getAllDoctors = async () => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               d.years_experience, d.consultation_fee, d.bio, d.license_number,
               array_agg(
                   json_build_object(
                       'id', s.id,
                       'name', s.name,
                       'description', s.description,
                       'years_experience', ds.years_experience,
                       'certification', ds.certification
                   )
               ) FILTER (WHERE s.id IS NOT NULL) as specializations
        FROM users u
        LEFT JOIN doctor_profiles d ON u.id = d.user_id
        LEFT JOIN doctor_specializations ds ON u.id = ds.doctor_id
        LEFT JOIN specializations s ON ds.specialization_id = s.id
        WHERE u.role = 'doctor'
        GROUP BY u.id, d.user_id
        ORDER BY u.first_name, u.last_name
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Get doctor by ID with profile and specializations
export const getDoctorById = async (doctorId) => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               d.years_experience, d.consultation_fee, d.bio, d.license_number, d.availability_hours,
               array_agg(
                   json_build_object(
                       'id', s.id,
                       'name', s.name,
                       'description', s.description,
                       'years_experience', ds.years_experience,
                       'certification', ds.certification
                   )
               ) FILTER (WHERE s.id IS NOT NULL) as specializations
        FROM users u
        LEFT JOIN doctor_profiles d ON u.id = d.user_id
        LEFT JOIN doctor_specializations ds ON u.id = ds.doctor_id
        LEFT JOIN specializations s ON ds.specialization_id = s.id
        WHERE u.id = $1 AND u.role = 'doctor'
        GROUP BY u.id, d.user_id
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows[0];
};

// Get doctors by specialization with pagination
export const getDoctorsBySpecialization = async (specializationId, limit = 10, offset = 0) => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               d.years_experience, d.consultation_fee, d.bio,
               ds.years_experience as specialization_experience, ds.certification,
               s.name as specialization_name, s.description as specialization_description
        FROM users u
        JOIN doctor_profiles d ON u.id = d.user_id
        JOIN doctor_specializations ds ON u.id = ds.doctor_id
        JOIN specializations s ON ds.specialization_id = s.id
        WHERE ds.specialization_id = $1 AND u.role = 'doctor'
        ORDER BY ds.years_experience DESC, u.first_name, u.last_name
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [specializationId, limit, offset]);
    return result.rows;
};

// Search doctors by name or specialization
export const searchDoctors = async (searchTerm, limit = 10, offset = 0) => {
    const query = `
        SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               d.years_experience, d.consultation_fee, d.bio,
               array_agg(
                   json_build_object(
                       'id', s.id,
                       'name', s.name,
                       'description', s.description,
                       'years_experience', ds.years_experience,
                       'certification', ds.certification
                   )
               ) FILTER (WHERE s.id IS NOT NULL) as specializations
        FROM users u
        LEFT JOIN doctor_profiles d ON u.id = d.user_id
        LEFT JOIN doctor_specializations ds ON u.id = ds.doctor_id
        LEFT JOIN specializations s ON ds.specialization_id = s.id
        WHERE u.role = 'doctor' AND (
            u.first_name ILIKE $1 OR 
            u.last_name ILIKE $1 OR 
            s.name ILIKE $1 OR
            CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
        )
        GROUP BY u.id, d.user_id
        ORDER BY u.first_name, u.last_name
        LIMIT $2 OFFSET $3
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, limit, offset]);
    return result.rows;
};

// Get doctor's resume document
export const getDoctorResume = async (doctorId) => {
    const query = `
        SELECT d.*
        FROM documents d
        WHERE d.patient_id = $1 
        AND d.document_type = 'resume' 
        AND d.is_public = true
        ORDER BY d.upload_date DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows[0];
};

// Get doctor statistics (for dashboard)
export const getDoctorStats = async (doctorId) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN a.status = 'scheduled' THEN 1 END) as scheduled_appointments,
            COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
            COUNT(CASE WHEN a.appointment_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments,
            COUNT(CASE WHEN a.appointment_date = CURRENT_DATE THEN 1 END) as today_appointments,
            COUNT(DISTINCT a.patient_id) as total_patients,
            COUNT(m.id) as unread_messages
        FROM users u
        LEFT JOIN appointments a ON u.id = a.doctor_id
        LEFT JOIN messages m ON u.id = m.receiver_id AND m.is_read = false
        WHERE u.id = $1 AND u.role = 'doctor'
        GROUP BY u.id
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows[0] || {
        scheduled_appointments: 0,
        completed_appointments: 0,
        upcoming_appointments: 0,
        today_appointments: 0,
        total_patients: 0,
        unread_messages: 0
    };
};

// Get available time slots for a doctor on a specific date
export const getDoctorAvailableSlots = async (doctorId, date) => {
    // This would be implemented based on doctor's availability_hours and existing appointments
    const query = `
        SELECT a.appointment_time
        FROM appointments a
        WHERE a.doctor_id = $1 
        AND a.appointment_date = $2 
        AND a.status NOT IN ('cancelled')
        ORDER BY a.appointment_time
    `;
    const result = await pool.query(query, [doctorId, date]);
    const bookedSlots = result.rows.map(row => row.appointment_time);
    
    // Return booked slots for now - frontend can calculate available slots
    return { bookedSlots };
};