import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const opportunitySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['job', 'internship'],
            index: true,
        },
        location: {
            type: String,
            trim: true,
            index: true,
        },
        workMode: {
            type: String,
            enum: ['onsite', 'remote', 'hybrid'],
            trim: true,
        },
        stipendOrSalaryRange: {
            type: String,
            trim: true,
        },
        requiredSkills: [
            {
                type: String,
                trim: true,
            },
        ],
        suitableCourses: [
            {
                type: String,
                trim: true,
            },
        ],
        applicationDeadline: {
            type: Date,
        },
        description: {
            type: String,
            trim: true,
        },
        employer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        applicationLink: {
            type: String,
            trim: true,
        },
        internalApplication: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'draft'],
            default: 'active',
            index: true,
        },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Opportunity = model('Opportunity', opportunitySchema);

export { Opportunity };