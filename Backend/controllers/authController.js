import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById, findOrCreateGoogleUser } from '../models/User.js';
import { createPatientProfile } from '../models/Patient.js';
import { createDoctorProfile } from '../models/Doctor.js';

const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};


const formatUserResponse = (user) => {
    return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        authProvider: user.auth_provider,
        profilePicture: user.profile_picture
    };
};


export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role, profileData } = req.body;

       
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

       
        const hashedPassword = await bcrypt.hash(password, 12);

        
        const userData = {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role
        };

        const newUser = await createUser(userData);

       
        if (role === 'patient' && profileData) {
            await createPatientProfile({ userId: newUser.id, ...profileData });
        } else if (role === 'doctor' && profileData) {
            await createDoctorProfile({ userId: newUser.id, ...profileData });
        }

     
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: formatUserResponse(newUser)
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

       
        if (user.auth_provider === 'google' && !user.password) {
            return res.status(400).json({ 
                message: 'This account uses Google login. Please use "Login with Google" button.',
                authProvider: 'google'
            });
        }

        
        if (user.auth_provider === 'local' || user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
        }

       
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


export const googleAuthSuccess = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({ message: 'Google authentication failed' });
        }

        
        const token = generateToken(req.user);

        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(formatUserResponse(req.user)))}`);

    } catch (error) {
        console.error('Google auth success error:', error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/error?message=Authentication failed`);
    }
};


export const googleAuthFailure = (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/error?message=Google authentication failed`);
};


export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const refreshToken = async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const token = generateToken(user);

        res.json({
            message: 'Token refreshed successfully',
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};