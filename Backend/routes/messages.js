import express from 'express';
import { 
    sendMessage,
    getMessage,
    getMyMessages,
    getConversationWith,
    markAsRead,
    getUnreadCount
} from '../controllers/messageController.js';
import { 
    authenticateToken, 
    requireRole 
} from '../middleware/auth.js';
import { 
    validateMessage,
    validateId 
} from '../middleware/validation.js';

const router = express.Router();

// Send new message
router.post('/', 
    authenticateToken, 
    validateMessage, 
    sendMessage
);

// Get specific message
router.get('/:id', 
    authenticateToken, 
    validateId, 
    getMessage
);

// Get all messages for current user
router.get('/', 
    authenticateToken, 
    getMyMessages
);

// Get conversation between current user and another user
router.get('/conversation/:userId', 
    authenticateToken, 
    validateId, 
    getConversationWith
);

// Mark message as read
router.put('/:id/read', 
    authenticateToken, 
    validateId, 
    markAsRead
);

// Get unread messages count
router.get('/unread/count', 
    authenticateToken, 
    getUnreadCount
);

// Get sent messages
router.get('/sent/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // This would filter messages where sender_id = userId
            // Implementation would be similar to getMyMessages but filtered
            res.json({ 
                message: 'Sent messages endpoint',
                userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get received messages
router.get('/received/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // This would filter messages where receiver_id = userId
            res.json({ 
                message: 'Received messages endpoint',
                userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get unread messages
router.get('/unread/list', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // This would filter messages where receiver_id = userId AND is_read = false
            res.json({ 
                message: 'Unread messages endpoint',
                userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Delete message (soft delete or hide from user)
router.delete('/:id', 
    authenticateToken, 
    validateId,
    async (req, res) => {
        try {
            const messageId = req.params.id;
            const userId = req.user.userId;
            
            // This would either delete the message or mark it as hidden for the user
            // Need to check if user is sender or receiver
            res.json({ 
                message: 'Delete message endpoint',
                messageId,
                userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Reply to message
router.post('/:id/reply', 
    authenticateToken, 
    validateId,
    validateMessage,
    async (req, res) => {
        try {
            const originalMessageId = req.params.id;
            const { messageContent } = req.body;
            
            // This would create a new message as a reply
            // Need to get original message to determine receiver and create subject
            res.json({ 
                message: 'Reply to message endpoint',
                originalMessageId,
                messageContent 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Mark all messages as read
router.put('/read/all', 
    authenticateToken, 
    async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // This would mark all messages where receiver_id = userId as read
            res.json({ 
                message: 'Mark all as read endpoint',
                userId 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;