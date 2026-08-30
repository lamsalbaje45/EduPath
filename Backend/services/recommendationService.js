/**
 * Recommendation Service
 * Provides recommendation logic for opportunities, classes, and resources
 * based on student profiles, skills, and preferences
 */

import { Opportunity } from '../models/opportunity.js';
import { OnlineClass } from '../models/onlineClass.js';
import { User } from '../models/user.js';

/**
 * Calculate match score between student profile and opportunity
 * @param {Object} student - Student user object
 * @param {Object} opportunity - Opportunity object
 * @returns {number} Match score (0-100)
 */
function calculateOpportunityMatchScore(student, opportunity) {
    let score = 0;

    // Skills match (40 points)
    if (student.skills && opportunity.requiredSkills) {
        const matchedSkills = student.skills.filter(skill =>
            opportunity.requiredSkills.some(req =>
                req.toLowerCase() === skill.toLowerCase()
            )
        );
        const skillsScore = (matchedSkills.length / opportunity.requiredSkills.length) * 40;
        score += Math.min(skillsScore, 40);
    }

    // Education level match (30 points)
    if (student.educationLevel && opportunity.minEducationLevel) {
        const educationLevels = ['high_school', 'associate', 'bachelor', 'master', 'phd'];
        const studentLevel = educationLevels.indexOf(student.educationLevel);
        const minLevel = educationLevels.indexOf(opportunity.minEducationLevel);
        if (studentLevel >= minLevel) {
            score += 30;
        }
    }

    // Major/Field match (20 points)
    if (student.major && opportunity.fieldOfStudy) {
        if (student.major.toLowerCase() === opportunity.fieldOfStudy.toLowerCase()) {
            score += 20;
        }
    }

    // Location preference match (10 points)
    if (student.preferredLocations && opportunity.location) {
        const locationMatch = student.preferredLocations.some(loc =>
            loc.toLowerCase() === opportunity.location.toLowerCase()
        );
        if (locationMatch) {
            score += 10;
        }
    }

    return Math.round(score);
}

/**
 * Get recommended opportunities for a student
 * @param {string} studentId - Student user ID
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Maximum number of recommendations (default: 10)
 * @param {number} options.minScore - Minimum match score filter (default: 50)
 * @returns {Promise<Array>} Array of recommended opportunities with scores
 */
export async function getRecommendedOpportunities(studentId, options = {}) {
    const { limit = 10, minScore = 50 } = options;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get all available opportunities
        const opportunities = await Opportunity.find({
            status: 'active',
            applicationDeadline: { $gt: new Date() },
        });

        // Calculate match scores
        const recommendedOpportunities = opportunities
            .map(opportunity => ({
                ...opportunity.toObject(),
                matchScore: calculateOpportunityMatchScore(student, opportunity),
            }))
            .filter(opp => opp.matchScore >= minScore)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return recommendedOpportunities;
    } catch (error) {
        console.error('Error getting recommended opportunities:', error);
        throw error;
    }
}

/**
 * Get recommended classes for a student
 * @param {string} studentId - Student user ID
 * @param {Object} options - Options for recommendation
 * @returns {Promise<Array>} Array of recommended classes
 */
export async function getRecommendedClasses(studentId, options = {}) {
    const { limit = 5 } = options;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get classes that match student's interests and current level
        const recommendedClasses = await OnlineClass.find({
            status: 'active',
            targetAudience: { $in: [student.educationLevel, 'all'] },
        })
            .limit(limit)
            .sort({ createdAt: -1 });

        return recommendedClasses;
    } catch (error) {
        console.error('Error getting recommended classes:', error);
        throw error;
    }
}

/**
 * Get trending opportunities based on application count
 * @param {Object} options - Options for recommendation
 * @returns {Promise<Array>} Array of trending opportunities
 */
export async function getTrendingOpportunities(options = {}) {
    const { limit = 5 } = options;

    try {
        const trendingOpportunities = await Opportunity.aggregate([
            {
                $match: {
                    status: 'active',
                    applicationDeadline: { $gt: new Date() },
                },
            },
            {
                $addFields: {
                    applicationCount: { $size: '$applications' },
                },
            },
            {
                $sort: { applicationCount: -1 },
            },
            {
                $limit: limit,
            },
        ]);

        return trendingOpportunities;
    } catch (error) {
        console.error('Error getting trending opportunities:', error);
        throw error;
    }
}

/**
 * Get similar opportunities based on a given opportunity
 * @param {string} opportunityId - Opportunity ID to find similar ones
 * @param {Object} options - Options for recommendation
 * @returns {Promise<Array>} Array of similar opportunities
 */
export async function getSimilarOpportunities(opportunityId, options = {}) {
    const { limit = 5 } = options;

    try {
        const baseOpportunity = await Opportunity.findById(opportunityId);
        if (!baseOpportunity) {
            throw new Error('Opportunity not found');
        }

        // Find opportunities with similar field of study or required skills
        const similarOpportunities = await Opportunity.find({
            _id: { $ne: opportunityId },
            status: 'active',
            $or: [
                { fieldOfStudy: baseOpportunity.fieldOfStudy },
                { requiredSkills: { $in: baseOpportunity.requiredSkills } },
            ],
        })
            .limit(limit)
            .sort({ createdAt: -1 });

        return similarOpportunities;
    } catch (error) {
        console.error('Error getting similar opportunities:', error);
        throw error;
    }
}
