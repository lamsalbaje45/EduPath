import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const collegeSchema = new Schema(
    {
        collegeName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        address: {
            type: String,
            trim: true,
        },
        affiliation: {
            type: String,
            trim: true,
            index: true,
        },
        courses: [
            {
                type: String,
                trim: true,
            },
        ],
        feeRange: {
            type: String,
            trim: true,
        },
        facilities: [
            {
                type: String,
                trim: true,
            },
        ],
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        admissionStatus: {
            type: String,
            enum: ['open', 'closed', 'coming_soon'],
            default: 'open',
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        contactEmail: {
            type: String,
            trim: true,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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

const College = model('College', collegeSchema);

export { College };