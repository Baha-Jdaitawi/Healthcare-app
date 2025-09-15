import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import passport from './config/passport.js';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import messageRoutes from './routes/messages.js';
import documentRoutes from './routes/documents.js';
import specializationRoutes from './routes/specializations.js';
import reviewRoutes from './routes/reviews.js';

// Import database connection
import pool from './config/database.js';

// Initialize dotenv
dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware for uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/specializations', specializationRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Healthcare API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.1.0',
        googleAuth: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'
    });
});

// Test database connection endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Database connection successful',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Healthcare Management System API',
        version: '1.1.0',
        description: 'Complete healthcare management system with Google OAuth',
        features: [
            'User Authentication (Local + Google OAuth)',
            'Doctor-Patient Management',
            'Appointment Scheduling',
            'Messaging System',
            'Document Management',
            'Doctor Specializations',
            'Resume/CV Upload for Doctors',
            'Public/Private Document Sharing',
            'Review & Rating System',
            'Doctor Response to Reviews'
        ],
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            appointments: '/api/appointments',
            messages: '/api/messages',
            documents: '/api/documents',
            specializations: '/api/specializations',
            reviews: '/api/reviews',
            health: '/api/health',
            dbTest: '/api/db-test',
            info: '/api/info'
        },
        googleAuth: {
            configured: process.env.GOOGLE_CLIENT_ID ? true : false,
            loginUrl: '/api/auth/google',
            callbackUrl: '/api/auth/google/callback'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Healthcare Management System API',
        version: '1.1.0',
        status: 'Active',
        features: [
            'Authentication & Authorization',
            'Google OAuth Integration',
            'Doctor Specializations',
            'Document Management',
            'Review System',
            'Appointment Booking',
            'Messaging System'
        ],
        quickStart: {
            documentation: '/api/info',
            health: '/api/health',
            database: '/api/db-test'
        }
    });
});

// 404 handler
// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Endpoint not found',
        requestedPath: req.originalUrl,
        availableEndpoints: {
            auth: '/api/auth',
            users: '/api/users',
            appointments: '/api/appointments',
            messages: '/api/messages',
            documents: '/api/documents',
            specializations: '/api/specializations',
            reviews: '/api/reviews'
        },
        hint: 'Check /api/info for complete API documentation'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    
    // Handle specific error types
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ 
            message: 'File too large. Maximum size is 10MB.'
        });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
            message: 'File too large. Maximum size is 10MB.'
        });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            message: 'Unexpected file field or too many files.'
        });
    }

    if (error.message && error.message.includes('Only images, PDFs, and Word documents are allowed')) {
        return res.status(400).json({ 
            message: 'Invalid file type. Only images, PDFs, and Word documents are allowed.'
        });
    }

    // Database errors
    if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ 
            message: 'Resource already exists or duplicate entry.'
        });
    }

    if (error.code === '23503') { // Foreign key constraint violation
        return res.status(400).json({ 
            message: 'Invalid reference to related resource.'
        });
    }

    if (error.code === '23514') { // Check constraint violation
        return res.status(400).json({ 
            message: 'Data validation failed. Please check your input.'
        });
    }

    // Default error response
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled'}`);
    console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Database Test: http://localhost:${PORT}/api/db-test`);
    console.log(`📁 Static Files: http://localhost:${PORT}/uploads`);
    console.log(`\n📚 Available Endpoints:`);
    console.log(`   • Authentication: /api/auth`);
    console.log(`   • Google Login: /api/auth/google`);
    console.log(`   • Users: /api/users`);
    console.log(`   • Appointments: /api/appointments`);
    console.log(`   • Messages: /api/messages`);
    console.log(`   • Documents: /api/documents`);
    console.log(`   • Specializations: /api/specializations`);
    console.log(`   • Reviews: /api/reviews`);
    console.log(`\n🎯 Ready to accept requests!`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    // Close database connections
    pool.end(() => {
        console.log('Database connection pool closed');
        
        // Exit process
        process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
        console.log('Forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;