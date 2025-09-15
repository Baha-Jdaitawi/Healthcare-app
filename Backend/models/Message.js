import pool from '../config/database.js';

// Create new message
export const createMessage = async (messageData) => {
    const { senderId, receiverId, subject, messageContent } = messageData;
    const query = `
        INSERT INTO messages (sender_id, receiver_id, subject, message_content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [senderId, receiverId, subject, messageContent];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get message by ID
export const getMessageById = async (messageId) => {
    const query = `
        SELECT m.*, 
               s.first_name as sender_first_name, s.last_name as sender_last_name, s.email as sender_email,
               r.first_name as receiver_first_name, r.last_name as receiver_last_name, r.email as receiver_email
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE m.id = $1
    `;
    const result = await pool.query(query, [messageId]);
    return result.rows[0];
};

// Get messages for a user (sent and received)
export const getMessagesByUserId = async (userId) => {
    const query = `
        SELECT m.*, 
               s.first_name as sender_first_name, s.last_name as sender_last_name,
               r.first_name as receiver_first_name, r.last_name as receiver_last_name
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Get conversation between two users
export const getConversation = async (userId1, userId2) => {
    const query = `
        SELECT m.*, 
               s.first_name as sender_first_name, s.last_name as sender_last_name,
               r.first_name as receiver_first_name, r.last_name as receiver_last_name
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
           OR (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [userId1, userId2]);
    return result.rows;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
    const query = `
        UPDATE messages 
        SET is_read = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [messageId]);
    return result.rows[0];
};

// Get unread messages count for a user
export const getUnreadMessagesCount = async (userId) => {
    const query = `
        SELECT COUNT(*) as unread_count
        FROM messages 
        WHERE receiver_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].unread_count);
};