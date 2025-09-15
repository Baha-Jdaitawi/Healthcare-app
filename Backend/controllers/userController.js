import { findUserById, updateUser } from '../models/User.js';
import { 
    getPatientProfileByUserId, 
    updatePatientProfile, 
    createPatientProfile,
    getAllPatients 
} from '../models/Patient.js';
import { 
    getDoctorProfileByUserId, 
    updateDoctorProfile, 
    createDoctorProfile,
    getAllDoctors,
    getDoctorById 
} from '../models/Doctor.js';

// Get user profile with role-specific data
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.user.userId;
        
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = null;
        
        if (user.role === 'patient') {
            profileData = await getPatientProfileByUserId(userId);
        } else if (user.role === 'doctor') {
            profileData = await getDoctorProfileByUserId(userId);
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
                createdAt: user.created_at
            },
            profile: profileData
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user basic info
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, phone } = req.body;

        const updatedUser = await updateUser(userId, { firstName, lastName, phone });
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                phone: updatedUser.phone,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update patient-specific profile
export const updatePatientProfileData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const profileData = req.body;

        // Check if profile exists, create if not
        let existingProfile = await getPatientProfileByUserId(userId);
        
        let updatedProfile;
        if (existingProfile) {
            updatedProfile = await updatePatientProfile(userId, profileData);
        } else {
            updatedProfile = await createPatientProfile({ userId, ...profileData });
        }

        res.json({
            message: 'Patient profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Update patient profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update doctor-specific profile
export const updateDoctorProfileData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const profileData = req.body;

        // Check if profile exists, create if not
        let existingProfile = await getDoctorProfileByUserId(userId);
        
        let updatedProfile;
        if (existingProfile) {
            updatedProfile = await updateDoctorProfile(userId, profileData);
        } else {
            updatedProfile = await createDoctorProfile({ userId, ...profileData });
        }

        res.json({
            message: 'Doctor profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Update doctor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all patients (for doctors/admin)
export const getPatients = async (req, res) => {
    try {
        const patients = await getAllPatients();
        
        res.json({
            message: 'Patients retrieved successfully',
            patients
        });

    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all doctors (for patients/admin)
export const getDoctors = async (req, res) => {
    try {
        const doctors = await getAllDoctors();
        
        res.json({
            message: 'Doctors retrieved successfully',
            doctors
        });

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get specific doctor details
export const getDoctorDetails = async (req, res) => {
    try {
        const doctorId = req.params.id;
        
        const doctor = await getDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({
            message: 'Doctor details retrieved successfully',
            doctor
        });

    } catch (error) {
        console.error('Get doctor details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};