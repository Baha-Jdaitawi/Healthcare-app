import pool from '../config/database.js';

// Create new review
export const createReview = async (reviewData) => {
    const { patientId, doctorId, appointmentId, rating, reviewText } = reviewData;
    const query = `
        INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, review_text)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [patientId, doctorId, appointmentId, rating, reviewText];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get review by ID
export const getReviewById = async (reviewId) => {
    const query = `
        SELECT r.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM reviews r
        JOIN users p ON r.patient_id = p.id
        JOIN users d ON r.doctor_id = d.id
        WHERE r.id = $1
    `;
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

// Get reviews for a doctor
export const getReviewsForDoctor = async (doctorId, limit = 10, offset = 0) => {
    const query = `
        SELECT r.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               p.profile_picture as patient_profile_picture
        FROM reviews r
        JOIN users p ON r.patient_id = p.id
        WHERE r.doctor_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [doctorId, limit, offset]);
    return result.rows;
};

// Get reviews by a patient
export const getReviewsByPatient = async (patientId) => {
    const query = `
        SELECT r.*, 
               d.first_name as doctor_first_name, d.last_name as doctor_last_name,
               d.profile_picture as doctor_profile_picture
        FROM reviews r
        JOIN users d ON r.doctor_id = d.id
        WHERE r.patient_id = $1
        ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
};

// Check if patient already reviewed doctor
export const getExistingReview = async (patientId, doctorId) => {
    const query = `
        SELECT r.*, 
               d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM reviews r
        JOIN users d ON r.doctor_id = d.id
        WHERE r.patient_id = $1 AND r.doctor_id = $2
    `;
    const result = await pool.query(query, [patientId, doctorId]);
    return result.rows[0];
};

// Update review
export const updateReview = async (reviewId, reviewData) => {
    const { rating, reviewText } = reviewData;
    const query = `
        UPDATE reviews 
        SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;
    const values = [rating, reviewText, reviewId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Delete review
export const deleteReview = async (reviewId) => {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

// Get doctor's average rating and review count
export const getDoctorRatingStats = async (doctorId) => {
    const query = `
        SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(rating), 1) as average_rating,
            COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
            COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
            COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
            COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
            COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM reviews 
        WHERE doctor_id = $1
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows[0] || {
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
    };
};

// Get recent reviews across all doctors (for homepage/admin)
export const getRecentReviews = async (limit = 10) => {
    const query = `
        SELECT r.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM reviews r
        JOIN users p ON r.patient_id = p.id
        JOIN users d ON r.doctor_id = d.id
        ORDER BY r.created_at DESC
        LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
};

// Create review response
export const createReviewResponse = async (responseData) => {
    const { reviewId, doctorId, responseText } = responseData;
    const query = `
        INSERT INTO review_responses (review_id, doctor_id, response_text)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [reviewId, doctorId, responseText];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get review response
export const getReviewResponse = async (reviewId) => {
    const query = `
        SELECT rr.*, 
               d.first_name as doctor_first_name, d.last_name as doctor_last_name
        FROM review_responses rr
        JOIN users d ON rr.doctor_id = d.id
        WHERE rr.review_id = $1
    `;
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

// Update review response
export const updateReviewResponse = async (reviewId, responseText) => {
    const query = `
        UPDATE review_responses 
        SET response_text = $1, updated_at = CURRENT_TIMESTAMP
        WHERE review_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [responseText, reviewId]);
    return result.rows[0];
};

// Delete review response
export const deleteReviewResponse = async (reviewId) => {
    const query = 'DELETE FROM review_responses WHERE review_id = $1 RETURNING *';
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

// Get reviews with responses for a doctor
export const getReviewsWithResponses = async (doctorId, limit = 10, offset = 0) => {
    const query = `
        SELECT r.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name,
               p.profile_picture as patient_profile_picture,
               rr.response_text, rr.created_at as response_created_at
        FROM reviews r
        JOIN users p ON r.patient_id = p.id
        LEFT JOIN review_responses rr ON r.id = rr.review_id
        WHERE r.doctor_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [doctorId, limit, offset]);
    return result.rows;
};

// Get top rated doctors
export const getTopRatedDoctors = async (limit = 10) => {
    const query = `
        SELECT d.id, d.first_name, d.last_name, d.profile_picture,
               dp.specialization, dp.consultation_fee,
               COUNT(r.id) as total_reviews,
               ROUND(AVG(r.rating), 1) as average_rating
        FROM users d
        LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
        LEFT JOIN reviews r ON d.id = r.doctor_id
        WHERE d.role = 'doctor'
        GROUP BY d.id, dp.specialization, dp.consultation_fee
        HAVING COUNT(r.id) > 0
        ORDER BY average_rating DESC, total_reviews DESC
        LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
};