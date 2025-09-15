import pool from '../config/database.js';

// Get all available specializations
export const getAllSpecializations = async () => {
    const query = 'SELECT * FROM specializations ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
};

// Get specialization by ID
export const getSpecializationById = async (id) => {
    const query = 'SELECT * FROM specializations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Get specialization by name
export const getSpecializationByName = async (name) => {
    const query = 'SELECT * FROM specializations WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
};

// Create new specialization (admin only)
export const createSpecialization = async (specializationData) => {
    const { name, description } = specializationData;
    const query = `
        INSERT INTO specializations (name, description)
        VALUES ($1, $2)
        RETURNING *
    `;
    const values = [name, description];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Update specialization (admin only)
export const updateSpecialization = async (id, specializationData) => {
    const { name, description } = specializationData;
    const query = `
        UPDATE specializations 
        SET name = $1, description = $2
        WHERE id = $3
        RETURNING *
    `;
    const values = [name, description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Delete specialization (admin only)
export const deleteSpecialization = async (id) => {
    const query = 'DELETE FROM specializations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Add doctor specialization
export const addDoctorSpecialization = async (doctorSpecializationData) => {
    const { doctorId, specializationId, yearsExperience, certification } = doctorSpecializationData;
    const query = `
        INSERT INTO doctor_specializations (doctor_id, specialization_id, years_experience, certification)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (doctor_id, specialization_id) 
        DO UPDATE SET 
            years_experience = EXCLUDED.years_experience,
            certification = EXCLUDED.certification
        RETURNING *
    `;
    const values = [doctorId, specializationId, yearsExperience || 0, certification];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Remove doctor specialization
export const removeDoctorSpecialization = async (doctorId, specializationId) => {
    const query = `
        DELETE FROM doctor_specializations 
        WHERE doctor_id = $1 AND specialization_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [doctorId, specializationId]);
    return result.rows[0];
};

// Get doctor's specializations
export const getDoctorSpecializations = async (doctorId) => {
    const query = `
        SELECT ds.*, s.name, s.description
        FROM doctor_specializations ds
        JOIN specializations s ON ds.specialization_id = s.id
        WHERE ds.doctor_id = $1
        ORDER BY s.name
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows;
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (specializationId) => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               ds.years_experience, ds.certification,
               dp.consultation_fee, dp.bio
        FROM users u
        JOIN doctor_specializations ds ON u.id = ds.doctor_id
        JOIN doctor_profiles dp ON u.id = dp.user_id
        WHERE ds.specialization_id = $1 AND u.role = 'doctor'
        ORDER BY u.first_name, u.last_name
    `;
    const result = await pool.query(query, [specializationId]);
    return result.rows;
};

// Search doctors by specialization name
export const searchDoctorsBySpecializationName = async (specializationName) => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture,
               ds.years_experience, ds.certification,
               dp.consultation_fee, dp.bio,
               s.name as specialization_name, s.description as specialization_description
        FROM users u
        JOIN doctor_specializations ds ON u.id = ds.doctor_id
        JOIN specializations s ON ds.specialization_id = s.id
        JOIN doctor_profiles dp ON u.id = dp.user_id
        WHERE s.name ILIKE $1 AND u.role = 'doctor'
        ORDER BY u.first_name, u.last_name
    `;
    const result = await pool.query(query, [`%${specializationName}%`]);
    return result.rows;
};

// Update doctor specialization details
export const updateDoctorSpecialization = async (doctorId, specializationId, updateData) => {
    const { yearsExperience, certification } = updateData;
    const query = `
        UPDATE doctor_specializations 
        SET years_experience = $1, certification = $2
        WHERE doctor_id = $3 AND specialization_id = $4
        RETURNING *
    `;
    const values = [yearsExperience, certification, doctorId, specializationId];
    const result = await pool.query(query, values);
    return result.rows[0];
};