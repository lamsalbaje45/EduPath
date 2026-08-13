import mongoose from 'mongoose';

import { ROLES } from '../config/roles.js';

const { Schema, model, Types } = mongoose;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.STUDENT,
            index: true,
        },
        accountStatus: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'pending'],
            default: 'active',
        },
        profileImage: {
            type: String,
            trim: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpiresAt: {
            type: Date,
            select: false,
        },
        studentProfile: {
            educationLevel: {
                type: String,
                trim: true,
            },
            currentCourse: {
                type: String,
                trim: true,
            },
            preferredCourses: [
                {
                    type: String,
                    trim: true,
                },
            ],
            preferredCities: [
                {
                    type: String,
                    trim: true,
                },
            ],
            skills: [
                {
                    type: String,
                    trim: true,
                },
            ],
            careerInterests: [
                {
                    type: String,
                    trim: true,
                },
            ],
            preferredOpportunityType: {
                type: String,
                trim: true,
            },
            portfolioLinks: [
                {
                    type: String,
                    trim: true,
                },
            ],
            bio: {
                type: String,
                trim: true,
            },
            address: {
                type: String,
                trim: true,
            },
            savedColleges: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'College',
                },
            ],
            savedOpportunities: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Opportunity',
                },
            ],
            savedClasses: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'OnlineClass',
                },
            ],
            recommendationPreferences: {
                type: Schema.Types.Mixed,
                default: {},
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = model('User', userSchema);

export { User };