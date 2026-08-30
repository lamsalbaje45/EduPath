/**
 * Recommendation Service
 * Provides recommendation logic for opportunities, classes, and colleges
 * based on student profiles, skills, and preferences
 * 
 * Scoring Rules:
 * 1. Match colleges by preferred courses and cities
 * 2. Match opportunities by skills, career interest, and opportunity type
 * 3. Match classes by missing or desired skills
 * 4. Score based on number of matching fields
 */

import { Opportunity } from '../models/opportunity.js';
import { OnlineClass } from '../models/onlineClass.js';
import { College } from '../models/college.js';
import { User } from '../models/user.js';

/**
 * Normalize string for case-insensitive comparison
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function normalizeString(str) {
    return str ? str.toLowerCase().trim() : '';
}

/**
 * Count matching items between two arrays
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {number} Count of matching items
 */
function countMatches(arr1, arr2) {
    if (!arr1 || !arr2) return 0;
    return arr1.filter(item1 =>
        arr2.some(item2 => normalizeString(item1) === normalizeString(item2))
    ).length;
}

/**
 * Check if arrays have any overlap (case-insensitive)
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} True if there's overlap
 */
function hasOverlap(arr1, arr2) {
    return countMatches(arr1, arr2) > 0;
}

/**
 * Calculate college recommendation score
 * Scoring:
 * - Course match: +1 point per matching course (max 10)
 * - City match: +10 points if city matches
 * - Admission status: +5 points if open
 * - Rating: +1 point per 0.5 stars (max 10)
 * 
 * @param {Object} student - Student user object
 * @param {Object} college - College object
 * @returns {Object} Score and matching details
 */
function calculateCollegeMatchScore(student, college) {
    let score = 0;
    const matches = {
        courses: 0,
        city: false,
        admissionOpen: false,
        rating: 0,
    };

    const studentProfile = student.studentProfile || {};
    const preferredCourses = studentProfile.preferredCourses || [];
    const preferredCities = studentProfile.preferredCities || [];
    const collegeCourses = college.courses || [];

    // Match courses (1 point per match, max 10)
    const courseMatches = countMatches(preferredCourses, collegeCourses);
    matches.courses = courseMatches;
    score += Math.min(courseMatches * 1, 10);

    // Match city (10 points)
    if (preferredCities.length > 0 && college.city) {
        const cityMatch = preferredCities.some(
            city => normalizeString(city) === normalizeString(college.city)
        );
        if (cityMatch) {
            score += 10;
            matches.city = true;
        }
    }

    // Admission status (5 points)
    if (college.admissionStatus === 'open') {
        score += 5;
        matches.admissionOpen = true;
    }

    // Rating bonus (1 point per 0.5 stars, max 10)
    if (college.rating && college.rating > 0) {
        matches.rating = college.rating;
        score += Math.min(Math.floor(college.rating * 2), 10);
    }

    return { score, matches };
}

/**
 * Calculate opportunity recommendation score
 * Scoring:
 * - Skills match: +2 points per matching skill (max 20)
 * - Career interest match: +15 points
 * - Opportunity type match: +10 points
 * - Suitable courses match: +1 point per match (max 10)
 * - Location match: +5 points
 * - Deadline not passed: +5 points
 * 
 * @param {Object} student - Student user object
 * @param {Object} opportunity - Opportunity object
 * @returns {Object} Score and matching details
 */
function calculateOpportunityMatchScore(student, opportunity) {
    let score = 0;
    const matches = {
        skills: 0,
        careerInterest: false,
        typeMatch: false,
        courses: 0,
        location: false,
        deadlineValid: false,
    };

    const studentProfile = student.studentProfile || {};
    const studentSkills = studentProfile.skills || [];
    const careerInterests = studentProfile.careerInterests || [];
    const preferredOpportunityType = studentProfile.preferredOpportunityType;
    const preferredCities = studentProfile.preferredCities || [];
    const currentCourse = studentProfile.currentCourse;

    // Skills match (2 points per skill, max 20)
    const skillMatches = countMatches(studentSkills, opportunity.requiredSkills || []);
    matches.skills = skillMatches;
    score += Math.min(skillMatches * 2, 20);

    // Career interest match (15 points)
    if (careerInterests.length > 0) {
        const opportunityTitle = opportunity.title ? opportunity.title.toLowerCase() : '';
        const careerMatch = careerInterests.some(interest =>
            opportunityTitle.includes(normalizeString(interest))
        );
        if (careerMatch) {
            score += 15;
            matches.careerInterest = true;
        }
    }

    // Opportunity type match (10 points)
    if (
        preferredOpportunityType &&
        opportunity.type &&
        normalizeString(preferredOpportunityType) === normalizeString(opportunity.type)
    ) {
        score += 10;
        matches.typeMatch = true;
    }

    // Suitable courses match (1 point per match, max 10)
    if (currentCourse && opportunity.suitableCourses) {
        const courseMatches = countMatches([currentCourse], opportunity.suitableCourses);
        matches.courses = courseMatches;
        score += Math.min(courseMatches * 1, 10);
    }

    // Location match (5 points)
    if (preferredCities.length > 0 && opportunity.location) {
        const locationMatch = preferredCities.some(
            city => normalizeString(city) === normalizeString(opportunity.location)
        );
        if (locationMatch) {
            score += 5;
            matches.location = true;
        }
    }

    // Deadline validation (5 points)
    if (opportunity.applicationDeadline && new Date(opportunity.applicationDeadline) > new Date()) {
        score += 5;
        matches.deadlineValid = true;
    }

    return { score, matches };
}

/**
 * Calculate class recommendation score
 * Scoring:
 * - Subject match with desired skills: +3 points per skill (max 15)
 * - Level match: +10 points if appropriate level
 * - Certificate availability: +5 points
 * - Price (free): +5 points
 * - Upcoming/Active: +5 points
 * 
 * @param {Object} student - Student user object
 * @param {Object} onlineClass - Online class object
 * @returns {Object} Score and matching details
 */
function calculateClassMatchScore(student, onlineClass) {
    let score = 0;
    const matches = {
        skills: 0,
        levelMatch: false,
        hasCertificate: false,
        isFree: false,
        isActive: false,
    };

    const studentProfile = student.studentProfile || {};
    const studentSkills = studentProfile.skills || [];
    const educationLevel = studentProfile.educationLevel;
    const classSubjects = onlineClass.subjects || [];

    // Subject/Skills match (3 points per match, max 15)
    const skillMatches = countMatches(studentSkills, classSubjects);
    matches.skills = skillMatches;
    score += Math.min(skillMatches * 3, 15);

    // Level match (10 points)
    if (educationLevel && onlineClass.level) {
        if (normalizeString(educationLevel) === normalizeString(onlineClass.level)) {
            score += 10;
            matches.levelMatch = true;
        }
    }

    // Certificate availability (5 points)
    if (onlineClass.certificateAvailability) {
        score += 5;
        matches.hasCertificate = true;
    }

    // Free price (5 points)
    if (onlineClass.price === 0 || !onlineClass.price) {
        score += 5;
        matches.isFree = true;
    }

    // Active/Upcoming class (5 points)
    if (onlineClass.startDate && new Date(onlineClass.startDate) > new Date()) {
        score += 5;
        matches.isActive = true;
    }

    return { score, matches };
}

/**
 * Get recommended opportunities for a student
 * @param {string} studentId - Student user ID
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Maximum number of recommendations (default: 10)
 * @param {number} options.minScore - Minimum match score filter (default: 0)
 * @returns {Promise<Array>} Array of recommended opportunities with scores
 */
export async function getRecommendedOpportunities(studentId, options = {}) {
    const { limit = 10, minScore = 0 } = options;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get all active opportunities with valid deadlines
        const opportunities = await Opportunity.find({
            status: 'active',
            approvalStatus: 'approved',
            applicationDeadline: { $gt: new Date() },
        }).lean();

        // Calculate scores for all opportunities
        const scoredOpportunities = opportunities
            .map(opportunity => {
                const { score, matches } = calculateOpportunityMatchScore(student, opportunity);
                return {
                    ...opportunity,
                    matchScore: score,
                    matchDetails: matches,
                };
            })
            .filter(opp => opp.matchScore >= minScore)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return scoredOpportunities;
    } catch (error) {
        console.error('Error getting recommended opportunities:', error);
        throw error;
    }
}

/**
 * Get recommended colleges for a student
 * @param {string} studentId - Student user ID
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Maximum number of recommendations (default: 5)
 * @param {number} options.minScore - Minimum match score filter (default: 0)
 * @returns {Promise<Array>} Array of recommended colleges with scores
 */
export async function getRecommendedColleges(studentId, options = {}) {
    const { limit = 5, minScore = 0 } = options;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get all colleges with open admission
        const colleges = await College.find({
            admissionStatus: { $in: ['open', 'coming_soon'] },
        }).lean();

        // Calculate scores for all colleges
        const scoredColleges = colleges
            .map(college => {
                const { score, matches } = calculateCollegeMatchScore(student, college);
                return {
                    ...college,
                    matchScore: score,
                    matchDetails: matches,
                };
            })
            .filter(college => college.matchScore >= minScore)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return scoredColleges;
    } catch (error) {
        console.error('Error getting recommended colleges:', error);
        throw error;
    }
}

/**
 * Get recommended classes for a student
 * @param {string} studentId - Student user ID
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Maximum number of recommendations (default: 5)
 * @param {number} options.minScore - Minimum match score filter (default: 0)
 * @returns {Promise<Array>} Array of recommended classes with scores
 */
export async function getRecommendedClasses(studentId, options = {}) {
    const { limit = 5, minScore = 0 } = options;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Get all upcoming/active classes
        const classes = await OnlineClass.find({
            approvalStatus: 'approved',
            startDate: { $gt: new Date() },
        }).lean();

        // Calculate scores for all classes
        const scoredClasses = classes
            .map(onlineClass => {
                const { score, matches } = calculateClassMatchScore(student, onlineClass);
                return {
                    ...onlineClass,
                    matchScore: score,
                    matchDetails: matches,
                };
            })
            .filter(cls => cls.matchScore >= minScore)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return scoredClasses;
    } catch (error) {
        console.error('Error getting recommended classes:', error);
        throw error;
    }
}

/**
 * Get recommendations across all categories (one-stop recommendation)
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object>} Object containing recommendations for opportunities, colleges, and classes
 */
export async function getAllRecommendations(studentId) {
    try {
        const [opportunities, colleges, classes] = await Promise.all([
            getRecommendedOpportunities(studentId, { limit: 5 }),
            getRecommendedColleges(studentId, { limit: 3 }),
            getRecommendedClasses(studentId, { limit: 3 }),
        ]);

        return {
            opportunities,
            colleges,
            classes,
            timestamp: new Date(),
        };
    } catch (error) {
        console.error('Error getting all recommendations:', error);
        throw error;
    }
}

/**
 * Get trending opportunities (most applications)
 * @param {Object} options - Options for recommendation
 * @param {number} options.limit - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of trending opportunities
 */
export async function getTrendingOpportunities(options = {}) {
    const { limit = 5 } = options;

    try {
        const trendingOpportunities = await Opportunity.find({
            status: 'active',
            approvalStatus: 'approved',
            applicationDeadline: { $gt: new Date() },
        })
            .sort({ applications: -1 })
            .limit(limit)
            .lean();

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
 * @param {number} options.limit - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of similar opportunities
 */
export async function getSimilarOpportunities(opportunityId, options = {}) {
    const { limit = 5 } = options;

    try {
        const baseOpportunity = await Opportunity.findById(opportunityId);
        if (!baseOpportunity) {
            throw new Error('Opportunity not found');
        }

        // Find opportunities with similar skills or suitable courses
        const similarOpportunities = await Opportunity.find({
            _id: { $ne: opportunityId },
            status: 'active',
            approvalStatus: 'approved',
            $or: [
                { requiredSkills: { $in: baseOpportunity.requiredSkills || [] } },
                { suitableCourses: { $in: baseOpportunity.suitableCourses || [] } },
                { type: baseOpportunity.type },
            ],
        })
            .limit(limit)
            .lean();

        return similarOpportunities;
    } catch (error) {
        console.error('Error getting similar opportunities:', error);
        throw error;
    }
}

/**
 * Get students who might be interested in a specific opportunity
 * (Useful for employers to target students)
 * @param {string} opportunityId - Opportunity ID
 * @param {Object} options - Options
 * @param {number} options.limit - Maximum number of students (default: 10)
 * @returns {Promise<Array>} Array of matching students with match scores
 */
export async function getInterestingStudentsForOpportunity(opportunityId, options = {}) {
    const { limit = 10 } = options;

    try {
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }

        // Get all active students
        const students = await User.find({
            role: 'student',
            accountStatus: 'active',
        }).lean();

        // Calculate match scores
        const scoredStudents = students
            .map(student => {
                const { score, matches } = calculateOpportunityMatchScore(student, opportunity);
                return {
                    studentId: student._id,
                    fullName: student.fullName,
                    email: student.email,
                    matchScore: score,
                    matchDetails: matches,
                };
            })
            .filter(student => student.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return scoredStudents;
    } catch (error) {
        console.error('Error getting interested students:', error);
        throw error;
    }
}

/**
 * Get recommended colleges for all students (for bulk recommendation)
 * @param {Object} options - Options
 * @param {number} options.limit - Max colleges per student (default: 3)
 * @returns {Promise<Array>} Array of all students with their recommended colleges
 */
export async function getAllStudentCollegeRecommendations(options = {}) {
    const { limit = 3 } = options;

    try {
        const students = await User.find({
            role: 'student',
            accountStatus: 'active',
        }).lean();

        const recommendations = await Promise.all(
            students.map(async student => ({
                studentId: student._id,
                fullName: student.fullName,
                recommendations: await getRecommendedColleges(student._id.toString(), { limit }),
            }))
        );

        return recommendations;
    } catch (error) {
        console.error('Error getting student college recommendations:', error);
        throw error;
    }
}
