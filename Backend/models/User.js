import pool from '../config/database.js';

// Create new user
export const createUser = async (userData) => {
    const { email, password, firstName, lastName, phone, role } = userData;
    const query = `
        INSERT INTO users (email, password, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone, role, created_at
    `;
    const values = [email, password, firstName, lastName, phone, role];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Find user by email
export const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// Find user by ID
export const findUserById = async (id) => {
    const query = 'SELECT id, email, first_name, last_name, phone, role, google_id, auth_provider, profile_picture, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Find user by Google ID
export const findUserByGoogleId = async (googleId) => {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
};

// Update user
export const updateUser = async (id, userData) => {
    const { firstName, lastName, phone } = userData;
    const query = `
        UPDATE users 
        SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, email, first_name, last_name, phone, role, profile_picture, updated_at
    `;
    const values = [firstName, lastName, phone, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Find or create Google user
export const findOrCreateGoogleUser = async (googleProfile) => {
    const { id, emails, name, photos } = googleProfile;
    const email = emails[0].value;
    const profilePicture = photos && photos[0] ? photos[0].value : null;
    
    // Check if user already exists with this Google ID
    let user = await findUserByGoogleId(id);
    
    if (user) {
        return user;
    }
    
    // Check if user exists with same email (link accounts)
    user = await findUserByEmail(email);
    
    if (user) {
        // Link Google account to existing user
        const query = `
            UPDATE users 
            SET google_id = $1, auth_provider = 'google', profile_picture = $2, updated_at = CURRENT_TIMESTAMP
            WHERE email = $3
            RETURNING *
        `;
        const result = await pool.query(query, [id, profilePicture, email]);
        return result.rows[0];
    }
    
    // Create new user
    const query = `
        INSERT INTO users (email, first_name, last_name, google_id, auth_provider, profile_picture, role)
        VALUES ($1, $2, $3, $4, 'google', $5, 'patient')
        RETURNING *
    `;
    const values = [
        email, 
        name.givenName || '', 
        name.familyName || '', 
        id, 
        profilePicture
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Update user profile picture
export const updateProfilePicture = async (userId, profilePicture) => {
    const query = `
        UPDATE users 
        SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, first_name, last_name, phone, role, profile_picture
    `;
    const result = await pool.query(query, [profilePicture, userId]);
    return result.rows[0];
};