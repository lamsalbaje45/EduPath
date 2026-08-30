/**
 * Recommendations Routes
 * API endpoints for personalized recommendations
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getAllRecommendationsForStudent,
    getRecommendedOpportunitiesForStudent,
    getRecommendedCollegesForStudent,
    getRecommendedClassesForStudent,
    getTrendingOpportunitiesHandler,
    getSimilarOpportunitiesHandler,
    getInterestedStudentsForOpportunityHandler,
    getRecommendationExplanation,
} from '../controllers/recommendationsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/recommendations/all
 * Get all recommendations (opportunities, colleges, classes) for logged-in student
 */
router.get('/all', getAllRecommendationsForStudent);

/**
 * GET /api/recommendations/opportunities
 * Get recommended opportunities for logged-in student
 * Query params: limit, minScore
 */
router.get('/opportunities', getRecommendedOpportunitiesForStudent);

/**
 * GET /api/recommendations/colleges
 * Get recommended colleges for logged-in student
 * Query params: limit, minScore
 */
router.get('/colleges', getRecommendedCollegesForStudent);

/**
 * GET /api/recommendations/classes
 * Get recommended classes for logged-in student
 * Query params: limit, minScore
 */
router.get('/classes', getRecommendedClassesForStudent);

/**
 * GET /api/recommendations/trending
 * Get trending opportunities across all students
 * Query params: limit
 */
router.get('/trending', getTrendingOpportunitiesHandler);

/**
 * GET /api/recommendations/opportunities/:opportunityId/similar
 * Get opportunities similar to a specific opportunity
 * Query params: limit
 */
router.get('/opportunities/:opportunityId/similar', getSimilarOpportunitiesHandler);

/**
 * GET /api/recommendations/opportunities/:opportunityId/interested-students
 * Get students interested in a specific opportunity (Employer/Admin only)
 * Query params: limit
 */
router.get('/opportunities/:opportunityId/interested-students', getInterestedStudentsForOpportunityHandler);

/**
 * GET /api/recommendations/explain/:type/:id
 * Get explanation for why a specific item was recommended
 * Params: type (opportunity, college, class), id (item ID)
 */
router.get('/explain/:type/:id', getRecommendationExplanation);

export default router;
