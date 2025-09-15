import pool from '../config/database.js';

// Create patient profile
export const createPatientProfile = async (profileData) => {
    const { userId, dateOfBirth, gender, address, emergencyContact, emergencyPhone, medicalConditions, allergies, bloodType } = profileData;
    const query = `
        INSERT INTO patient_profiles (user_id, date_of_birth, gender, address, emergency_contact, emergency_phone, medical_conditions, allergies, blood_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    const values = [userId, dateOfBirth, gender, address, emergencyContact, emergencyPhone, medicalConditions, allergies, bloodType];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get patient profile by user ID
export const getPatientProfileByUserId = async (userId) => {
    const query = 'SELECT * FROM patient_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

// Update patient profile
export const updatePatientProfile = async (userId, profileData) => {
    const { dateOfBirth, gender, address, emergencyContact, emergencyPhone, medicalConditions, allergies, bloodType } = profileData;
    const query = `
        UPDATE patient_profiles 
        SET date_of_birth = $1, gender = $2, address = $3, emergency_contact = $4, 
            emergency_phone = $5, medical_conditions = $6, allergies = $7, blood_type = $8
        WHERE user_id = $9
        RETURNING *
    `;
    const values = [dateOfBirth, gender, address, emergencyContact, emergencyPhone, medicalConditions, allergies, bloodType, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get all patients
export const getAllPatients = async () => {
    const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
               p.date_of_birth, p.gender, p.address, p.blood_type
        FROM users u
        LEFT JOIN patient_profiles p ON u.id = p.user_id
        WHERE u.role = 'patient'
    `;
    const result = await pool.query(query);
    return result.rows;
};