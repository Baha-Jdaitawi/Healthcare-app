import {
    createAppointment,
    getAppointmentById,
    getAppointmentsByPatientId,
    getAppointmentsByDoctorId,
    updateAppointmentStatus,
    addConsultationNotes
} from '../models/Appointment.js';

// Create new appointment
export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime, reasonForVisit, consultationFee } = req.body;
        const patientId = req.user.userId;

        const appointmentData = {
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            reasonForVisit,
            consultationFee
        };

        const newAppointment = await createAppointment(appointmentData);

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: newAppointment
        });

    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ message: 'Server error while booking appointment' });
    }
};


export const getAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const appointment = await getAppointmentById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        
        if (userRole !== 'admin' && 
            appointment.patient_id !== userId && 
            appointment.doctor_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({
            message: 'Appointment retrieved successfully',
            appointment
        });

    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        let appointments;
        
        if (userRole === 'patient') {
            appointments = await getAppointmentsByPatientId(userId);
        } else if (userRole === 'doctor') {
            appointments = await getAppointmentsByDoctorId(userId);
        } else {
            return res.status(400).json({ message: 'Invalid user role for appointments' });
        }

        res.json({
            message: 'Appointments retrieved successfully',
            appointments
        });

    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const userRole = req.user.role;

        if (userRole !== 'doctor' && userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const appointments = await getAppointmentsByPatientId(patientId);

        res.json({
            message: 'Patient appointments retrieved successfully',
            appointments
        });

    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const appointment = await getAppointmentById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

       
        if (userRole === 'patient' && appointment.patient_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        if (userRole === 'doctor' && appointment.doctor_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedAppointment = await updateAppointmentStatus(appointmentId, status);

        res.json({
            message: 'Appointment status updated successfully',
            appointment: updatedAppointment
        });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const addNotes = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { notes } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (userRole !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can add consultation notes' });
        }

        const appointment = await getAppointmentById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedAppointment = await addConsultationNotes(appointmentId, notes);

        res.json({
            message: 'Consultation notes added successfully',
            appointment: updatedAppointment
        });

    } catch (error) {
        console.error('Add consultation notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};