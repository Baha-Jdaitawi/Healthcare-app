import {
    createReview,
    getReviewById,
    getReviewsForDoctor,
    getReviewsByPatient,
    getExistingReview,
    updateReview,
    deleteReview,
    getDoctorRatingStats,
    getRecentReviews,
    createReviewResponse,
    getReviewResponse,
    updateReviewResponse,
    deleteReviewResponse,
    getReviewsWithResponses,
    getTopRatedDoctors
} from '../models/Review.js';


export const addReview = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating, reviewText } = req.body;
        const patientId = req.user.userId;

       
        const existingReview = await getExistingReview(patientId, doctorId);
        if (existingReview) {
            return res.status(400).json({ 
                message: 'You have already reviewed this doctor. You can edit your existing review.',
                existingReview
            });
        }

        const reviewData = {
            patientId,
            doctorId,
            appointmentId,
            rating,
            reviewText
        };

        const newReview = await createReview(reviewData);

        res.status(201).json({
            message: 'Review added successfully',
            review: newReview
        });

    } catch (error) {
        console.error('Add review error:', error);
        if (error.code === '23503') { 
            return res.status(400).json({ message: 'Invalid doctor or appointment ID' });
        }
        res.status(500).json({ message: 'Server error while adding review' });
    }
};


export const getReview = async (req, res) => {
    try {
        const reviewId = req.params.id;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        
        const response = await getReviewResponse(reviewId);

        res.json({
            message: 'Review retrieved successfully',
            review: {
                ...review,
                response
            }
        });

    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDoctorReviews = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const reviews = await getReviewsWithResponses(doctorId, limit, offset);
        const stats = await getDoctorRatingStats(doctorId);

        res.json({
            message: 'Doctor reviews retrieved successfully',
            reviews,
            stats,
            pagination: {
                page,
                limit,
                total: parseInt(stats.total_reviews)
            }
        });

    } catch (error) {
        console.error('Get doctor reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getMyReviews = async (req, res) => {
    try {
        const patientId = req.user.userId;

        const reviews = await getReviewsByPatient(patientId);

        res.json({
            message: 'Your reviews retrieved successfully',
            reviews
        });

    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateReviewData = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, reviewText } = req.body;
        const userId = req.user.userId;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

       
        if (review.patient_id !== userId) {
            return res.status(403).json({ message: 'You can only edit your own reviews' });
        }

        const updatedReview = await updateReview(reviewId, { rating, reviewText });

        res.json({
            message: 'Review updated successfully',
            review: updatedReview
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const removeReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

       
        if (review.patient_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        await deleteReview(reviewId);

        res.json({
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        const stats = await getDoctorRatingStats(doctorId);

        res.json({
            message: 'Doctor rating statistics retrieved successfully',
            stats
        });

    } catch (error) {
        console.error('Get doctor stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const addReviewResponse = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { responseText } = req.body;
        const doctorId = req.user.userId;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

      
        if (review.doctor_id !== doctorId) {
            return res.status(403).json({ message: 'You can only respond to your own reviews' });
        }

       
        const existingResponse = await getReviewResponse(reviewId);
        if (existingResponse) {
            return res.status(400).json({ message: 'Response already exists. Use update instead.' });
        }

        const responseData = {
            reviewId,
            doctorId,
            responseText
        };

        const newResponse = await createReviewResponse(responseData);

        res.status(201).json({
            message: 'Review response added successfully',
            response: newResponse
        });

    } catch (error) {
        console.error('Add review response error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateReviewResponseData = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { responseText } = req.body;
        const doctorId = req.user.userId;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

     
        if (review.doctor_id !== doctorId) {
            return res.status(403).json({ message: 'You can only update your own responses' });
        }

        const updatedResponse = await updateReviewResponse(reviewId, responseText);
        if (!updatedResponse) {
            return res.status(404).json({ message: 'Response not found' });
        }

        res.json({
            message: 'Review response updated successfully',
            response: updatedResponse
        });

    } catch (error) {
        console.error('Update review response error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const removeReviewResponse = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const doctorId = req.user.userId;

        const review = await getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

    
        if (review.doctor_id !== doctorId) {
            return res.status(403).json({ message: 'You can only delete your own responses' });
        }

        const deletedResponse = await deleteReviewResponse(reviewId);
        if (!deletedResponse) {
            return res.status(404).json({ message: 'Response not found' });
        }

        res.json({
            message: 'Review response deleted successfully'
        });

    } catch (error) {
        console.error('Delete review response error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getRecentReviewsData = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const reviews = await getRecentReviews(limit);

        res.json({
            message: 'Recent reviews retrieved successfully',
            reviews
        });

    } catch (error) {
        console.error('Get recent reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTopRatedDoctorsData = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const doctors = await getTopRatedDoctors(limit);

        res.json({
            message: 'Top rated doctors retrieved successfully',
            doctors
        });

    } catch (error) {
        console.error('Get top rated doctors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const canReviewDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const patientId = req.user.userId;

        // Check if patient already reviewed this doctor
        const existingReview = await getExistingReview(patientId, doctorId);
        
        if (existingReview) {
            return res.json({
                canReview: false,
                reason: 'already_reviewed',
                existingReview
            });
        }

      

        res.json({
            canReview: true,
            reason: 'eligible'
        });

    } catch (error) {
        console.error('Can review doctor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};