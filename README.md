# HealthCare Pro

A comprehensive healthcare management system built with React and Node.js, designed to connect patients, doctors, and administrators in a seamless digital healthcare platform.

## Overview

HealthCare Pro is a full-stack web application that modernizes healthcare interactions by providing an intuitive platform for appointment scheduling, document management, and patient-doctor communication. The system features role-based access control, ensuring that patients, doctors, and administrators each have tailored experiences that meet their specific needs.

## Features

### For Patients
- **Dashboard**: Personal health overview with upcoming appointments and recent documents
- **Doctor Search**: Find healthcare providers by specialization, location, and availability
- **Appointment Booking**: Schedule appointments with preferred doctors using an interactive calendar
- **Document Management**: Securely upload, view, and organize medical documents
- **Profile Management**: Maintain personal health information and contact details

### For Doctors
- **Professional Dashboard**: Manage daily schedule and patient interactions
- **Appointment Management**: View, confirm, and update appointment statuses
- **Patient Records**: Access patient documents and medical history
- **Profile Customization**: Showcase qualifications, specializations, and availability

### For Administrators
- **System Overview**: Monitor platform usage and user statistics
- **User Management**: Verify doctor credentials and manage user accounts
- **Content Moderation**: Review and approve patient reviews and documents
- **Analytics**: Track system performance and user engagement

## Technology Stack

**Frontend:**
- React with modern functional components and hooks
- React Router for navigation and protected routes
- Tailwind CSS for responsive, professional styling
- Context API for state management
- Vite for fast development and building

**Backend:**
- Node.js with Express framework
- PostgreSQL database with proper relational design
- JWT authentication with role-based access control
- Google OAuth integration for seamless login
- Multer for secure file uploads
- bcrypt for password security

**Authentication & Security:**
- JWT token-based authentication
- Role-based route protection
- Secure password hashing
- Google OAuth 2.0 integration
- CORS configuration
- Input validation and sanitization

## Key Learning Outcomes

This project served as an intensive learning experience in modern web development, providing hands-on exposure to:

- **Full-Stack Integration**: Building cohesive frontend-backend communication with proper API design
- **Authentication Systems**: Implementing secure user authentication with multiple providers
- **Database Design**: Creating normalized database schemas for complex healthcare data relationships
- **Role-Based Access Control**: Developing sophisticated permission systems for different user types
- **State Management**: Managing complex application state across multiple contexts
- **UI/UX Design**: Creating intuitive, healthcare-focused user interfaces with accessibility in mind
- **File Management**: Handling secure document uploads and storage
- **Professional Development Practices**: Code organization, environment configuration, and deployment preparation

The complexity of healthcare workflows provided an excellent opportunity to understand real-world application architecture, data relationships, and user experience design challenges.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager




4. Start the development servers:
```bash

npm run dev:backend

# Frontend
npm run dev





## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

### Users & Doctors
- `GET /api/users/doctors` - List doctors with filters
- `GET /api/users/doctors/:id` - Get doctor details
- `PUT /api/users/profile` - Update user profile

## Contributing

This project follows standard development practices:

1. Create feature branches from main
2. Follow the existing code style and component patterns
3. Ensure all forms include proper validation
4. Test authentication flows for all user roles
5. Maintain responsive design principles
6. Update documentation for new features

## Security Considerations

- All routes implement proper authentication middleware
- User input is validated and sanitized
- File uploads are restricted by type and size
- Database queries use parameterized statements
- Environment variables protect sensitive configuration
- CORS is configured for appropriate origins

## Future Enhancements

- Real-time appointment notifications
- Video consultation integration
- Mobile application development
- Advanced analytics and reporting
- Integration with electronic health records 
- Multi-language support
- Telemedicine capabilities



