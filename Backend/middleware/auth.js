import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get fresh user data from database
        const user = await findUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        // Add user info to request object
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            authProvider: user.auth_provider,
            profilePicture: user.profile_picture
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error in authentication' });
    }
};

// Check if user has specific role(s)
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                userRole: userRole
            });
        }

        next();
    };
};

// Check if user is accessing their own resource
export const requireOwnership = (req, res, next) => {
    const userId = req.user.userId;
    const resourceUserId = req.params.userId || req.params.patientId || req.params.id;

    if (!resourceUserId) {
        return res.status(400).json({ message: 'Resource identifier required' });
    }

    if (parseInt(resourceUserId) !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied - not authorized to access this resource' });
    }

    next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await findUserById(decoded.userId);
            
            if (user) {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    authProvider: user.auth_provider,
                    profilePicture: user.profile_picture
                };
            }
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

// Admin only access
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

// Doctor only access
export const requireDoctor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Doctor access required' });
    }

    next();
};

// Patient only access
export const requirePatient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'patient' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Patient access required' });
    }

    next();
};