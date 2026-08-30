/**
 * Recommendations Controller
 * Handles API endpoints for personalized recommendations
 */

import {
    getRecommendedOpportunities,
    getRecommendedColleges,
    getRecommendedClasses,
    getAllRecommendations,
    getTrendingOpportunities,
    getSimilarOpportunities,
    getInterestingStudentsForOpportunity,
} from '../services/recommendationService.js';

import { asyncHandler, sendSuccess, sendError } from './controllerUtils.js';

/**
 * Get all recommendations for the logged-in student
 * GET /recommendations/all
 */
const getAllRecommendationsForStudent = asyncHandler(async (req, res) => {
    const studentId = req.user.id; // From auth middleware

    const recommendations = await getAllRecommendations(studentId);

    return sendSuccess(res, {
        message: 'Recommendations retrieved successfully.',
        data: recommendations,
    });
});

/**
 * Get recommended opportunities for the logged-in student
 * GET /recommendations/opportunities?limit=10&minScore=0
 */
const getRecommendedOpportunitiesForStudent = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { limit = 10, minScore = 0 } = req.query;

    const opportunities = await getRecommendedOpportunities(studentId, {
        limit: parseInt(limit),
        minScore: parseInt(minScore),
    });

    return sendSuccess(res, {
        message: 'Recommended opportunities retrieved successfully.',
        data: opportunities,
        count: opportunities.length,
    });
});

/**
 * Get recommended colleges for the logged-in student
 * GET /recommendations/colleges?limit=5&minScore=0
 */
const getRecommendedCollegesForStudent = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { limit = 5, minScore = 0 } = req.query;

    const colleges = await getRecommendedColleges(studentId, {
        limit: parseInt(limit),
        minScore: parseInt(minScore),
    });

    return sendSuccess(res, {
        message: 'Recommended colleges retrieved successfully.',
        data: colleges,
        count: colleges.length,
    });
});

/**
 * Get recommended classes for the logged-in student
 * GET /recommendations/classes?limit=5&minScore=0
 */
const getRecommendedClassesForStudent = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { limit = 5, minScore = 0 } = req.query;

    const classes = await getRecommendedClasses(studentId, {
        limit: parseInt(limit),
        minScore: parseInt(minScore),
    });

    return sendSuccess(res, {
        message: 'Recommended classes retrieved successfully.',
        data: classes,
        count: classes.length,
    });
});

/**
 * Get trending opportunities
 * GET /recommendations/trending?limit=5
 */
const getTrendingOpportunitiesHandler = asyncHandler(async (req, res) => {
    const { limit = 5 } = req.query;

    const opportunities = await getTrendingOpportunities({
        limit: parseInt(limit),
    });

    return sendSuccess(res, {
        message: 'Trending opportunities retrieved successfully.',
        data: opportunities,
        count: opportunities.length,
    });
});

/**
 * Get similar opportunities
 * GET /recommendations/opportunities/:opportunityId/similar?limit=5
 */
const getSimilarOpportunitiesHandler = asyncHandler(async (req, res) => {
    const { opportunityId } = req.params;
    const { limit = 5 } = req.query;

    const opportunities = await getSimilarOpportunities(opportunityId, {
        limit: parseInt(limit),
    });

    return sendSuccess(res, {
        message: 'Similar opportunities retrieved successfully.',
        data: opportunities,
        count: opportunities.length,
    });
});

/**
 * Get interested students for an opportunity (Admin/Employer only)
 * GET /recommendations/opportunities/:opportunityId/interested-students?limit=10
 */
const getInterestedStudentsForOpportunityHandler = asyncHandler(async (req, res) => {
    const { opportunityId } = req.params;
    const { limit = 10 } = req.query;

    // Check if user is employer or admin
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
        return sendError(res, {
            status: 403,
            message: 'You do not have permission to access this resource.',
        });
    }

    const students = await getInterestingStudentsForOpportunity(opportunityId, {
        limit: parseInt(limit),
    });

    return sendSuccess(res, {
        message: 'Interested students retrieved successfully.',
        data: students,
        count: students.length,
    });
});

/**
 * Get recommendation explanation (why was this item recommended)
 * GET /recommendations/explain/:type/:id
 * type: opportunity, college, class
 */
const getRecommendationExplanation = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const studentId = req.user.id;

    let recommendations;
    let relevantItem;

    if (type === 'opportunity') {
        recommendations = await getRecommendedOpportunities(studentId, { limit: 100 });
        relevantItem = recommendations.find(item => item._id.toString() === id);
    } else if (type === 'college') {
        recommendations = await getRecommendedColleges(studentId, { limit: 100 });
        relevantItem = recommendations.find(item => item._id.toString() === id);
    } else if (type === 'class') {
        recommendations = await getRecommendedClasses(studentId, { limit: 100 });
        relevantItem = recommendations.find(item => item._id.toString() === id);
    }

    if (!relevantItem) {
        return sendError(res, {
            status: 404,
            message: 'Item not found in recommendations.',
        });
    }

    return sendSuccess(res, {
        message: 'Recommendation explanation retrieved successfully.',
        data: {
            item: {
                id: relevantItem._id,
                title: relevantItem.title || relevantItem.collegeName || relevantItem.classTitle,
                type,
            },
            matchScore: relevantItem.matchScore,
            matchDetails: relevantItem.matchDetails,
            explanation: generateExplanation(type, relevantItem.matchDetails),
        },
    });
});

/**
 * Generate human-readable explanation for match
 * @param {string} type - Type of item (opportunity, college, class)
 * @param {Object} matches - Match details object
 * @returns {Array} Array of explanation strings
 */
function generateExplanation(type, matches) {
    const explanations = [];

    if (type === 'opportunity') {
        if (matches.skills > 0) {
            explanations.push(`${matches.skills} of your skills match the required skills`);
        }
        if (matches.typeMatch) {
            explanations.push('Matches your preferred opportunity type');
        }
        if (matches.careerInterest) {
            explanations.push('Aligns with your career interests');
        }
        if (matches.courses > 0) {
            explanations.push('Matches your current course');
        }
        if (matches.location) {
            explanations.push('Available in your preferred location');
        }
        if (matches.deadlineValid) {
            explanations.push('Application deadline has not passed');
        }
    } else if (type === 'college') {
        if (matches.courses > 0) {
            explanations.push(`Offers ${matches.courses} of your preferred courses`);
        }
        if (matches.city) {
            explanations.push('Located in your preferred city');
        }
        if (matches.admissionOpen) {
            explanations.push('Currently accepting applications');
        }
        if (matches.rating > 0) {
            explanations.push(`Highly rated (${matches.rating}/5 stars)`);
        }
    } else if (type === 'class') {
        if (matches.skills > 0) {
            explanations.push(`Teaches ${matches.skills} skills you want to learn`);
        }
        if (matches.levelMatch) {
            explanations.push('Matches your education level');
        }
        if (matches.hasCertificate) {
            explanations.push('Offers a certificate upon completion');
        }
        if (matches.isFree) {
            explanations.push('Free to enroll');
        }
        if (matches.isActive) {
            explanations.push('Class is starting soon');
        }
    }

    return explanations.length > 0 ? explanations : ['Matches your profile'];
}

export {
    getAllRecommendationsForStudent,
    getRecommendedOpportunitiesForStudent,
    getRecommendedCollegesForStudent,
    getRecommendedClassesForStudent,
    getTrendingOpportunitiesHandler,
    getSimilarOpportunitiesHandler,
    getInterestedStudentsForOpportunityHandler,
    getRecommendationExplanation,
};
