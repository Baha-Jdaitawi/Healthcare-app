import express from 'express';
import passport from 'passport';
import { 
    register, 
    login, 
    getProfile, 
    refreshToken, 
    logout,
    googleAuthSuccess,
    googleAuthFailure 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Local authentication routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/profile', authenticateToken, getProfile);
router.post('/refresh-token', authenticateToken, refreshToken);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/auth/google/failure',
        session: false 
    }),
    googleAuthSuccess
);

router.get('/google/success', googleAuthSuccess);
router.get('/google/failure', googleAuthFailure);

// Check authentication status
router.get('/check', authenticateToken, (req, res) => {
    res.json({
        message: 'User is authenticated',
        user: {
            id: req.user.userId,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            role: req.user.role,
            authProvider: req.user.authProvider,
            profilePicture: req.user.profilePicture
        }
    });
});

export default router;