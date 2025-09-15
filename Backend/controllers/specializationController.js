import {
    getAllSpecializations,
    getSpecializationById,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    addDoctorSpecialization,
    removeDoctorSpecialization,
    getDoctorSpecializations,
    getDoctorsBySpecialization,
    searchDoctorsBySpecializationName,
    updateDoctorSpecialization
} from '../models/Specialization.js';


export const getSpecializations = async (req, res) => {
    try {
        const specializations = await getAllSpecializations();
        
        res.json({
            message: 'Specializations retrieved successfully',
            specializations
        });
    } catch (error) {
        console.error('Get specializations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getSpecialization = async (req, res) => {
    try {
        const specializationId = req.params.id;
        
        const specialization = await getSpecializationById(specializationId);
        if (!specialization) {
            return res.status(404).json({ message: 'Specialization not found' });
        }
        
        res.json({
            message: 'Specialization retrieved successfully',
            specialization
        });
    } catch (error) {
        console.error('Get specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const createNewSpecialization = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const newSpecialization = await createSpecialization({ name, description });
        
        res.status(201).json({
            message: 'Specialization created successfully',
            specialization: newSpecialization
        });
    } catch (error) {
        console.error('Create specialization error:', error);
        if (error.code === '23505') { 
            return res.status(400).json({ message: 'Specialization with this name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateSpecializationData = async (req, res) => {
    try {
        const specializationId = req.params.id;
        const { name, description } = req.body;
        
        const updatedSpecialization = await updateSpecialization(specializationId, { name, description });
        
        if (!updatedSpecialization) {
            return res.status(404).json({ message: 'Specialization not found' });
        }
        
        res.json({
            message: 'Specialization updated successfully',
            specialization: updatedSpecialization
        });
    } catch (error) {
        console.error('Update specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const removeSpecialization = async (req, res) => {
    try {
        const specializationId = req.params.id;
        
        const deletedSpecialization = await deleteSpecialization(specializationId);
        
        if (!deletedSpecialization) {
            return res.status(404).json({ message: 'Specialization not found' });
        }
        
        res.json({
            message: 'Specialization deleted successfully'
        });
    } catch (error) {
        console.error('Delete specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const addDoctorSpecializationData = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const { specializationId, yearsExperience, certification } = req.body;
        
      
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only doctors can add specializations' });
        }
        
     
        const targetDoctorId = req.user.role === 'admin' && req.body.doctorId ? req.body.doctorId : doctorId;
        
        const doctorSpecialization = await addDoctorSpecialization({
            doctorId: targetDoctorId,
            specializationId,
            yearsExperience,
            certification
        });
        
        res.status(201).json({
            message: 'Specialization added to doctor successfully',
            doctorSpecialization
        });
    } catch (error) {
        console.error('Add doctor specialization error:', error);
        if (error.code === '23503') { 
            return res.status(400).json({ message: 'Invalid specialization or doctor ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


export const removeDoctorSpecializationData = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const specializationId = req.params.specializationId;
        
      
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only doctors can remove specializations' });
        }
        
        
        const targetDoctorId = req.user.role === 'admin' && req.body.doctorId ? req.body.doctorId : doctorId;
        
        const removedSpecialization = await removeDoctorSpecialization(targetDoctorId, specializationId);
        
        if (!removedSpecialization) {
            return res.status(404).json({ message: 'Doctor specialization not found' });
        }
        
        res.json({
            message: 'Specialization removed from doctor successfully'
        });
    } catch (error) {
        console.error('Remove doctor specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDoctorSpecializationsData = async (req, res) => {
    try {
        const doctorId = req.params.doctorId || req.user.userId;
        
        const specializations = await getDoctorSpecializations(doctorId);
        
        res.json({
            message: 'Doctor specializations retrieved successfully',
            specializations
        });
    } catch (error) {
        console.error('Get doctor specializations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateDoctorSpecializationData = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const specializationId = req.params.specializationId;
        const { yearsExperience, certification } = req.body;
        
        // Verify doctor role
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only doctors can update specializations' });
        }
        
        // For admin, allow specifying different doctor
        const targetDoctorId = req.user.role === 'admin' && req.body.doctorId ? req.body.doctorId : doctorId;
        
        const updatedSpecialization = await updateDoctorSpecialization(
            targetDoctorId, 
            specializationId, 
            { yearsExperience, certification }
        );
        
        if (!updatedSpecialization) {
            return res.status(404).json({ message: 'Doctor specialization not found' });
        }
        
        res.json({
            message: 'Doctor specialization updated successfully',
            doctorSpecialization: updatedSpecialization
        });
    } catch (error) {
        console.error('Update doctor specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get doctors by specialization
export const getDoctorsBySpecializationData = async (req, res) => {
    try {
        const specializationId = req.params.id;
        
        const doctors = await getDoctorsBySpecialization(specializationId);
        
        res.json({
            message: 'Doctors retrieved successfully',
            doctors
        });
    } catch (error) {
        console.error('Get doctors by specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search doctors by specialization name
export const searchDoctorsBySpecialization = async (req, res) => {
    try {
        const { specializationName } = req.query;
        
        if (!specializationName) {
            return res.status(400).json({ message: 'Specialization name is required for search' });
        }
        
        const doctors = await searchDoctorsBySpecializationName(specializationName);
        
        res.json({
            message: 'Doctors search completed successfully',
            doctors,
            searchTerm: specializationName
        });
    } catch (error) {
        console.error('Search doctors by specialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};