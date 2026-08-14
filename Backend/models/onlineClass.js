import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const onlineClassSchema = new Schema(
    {
        classTitle: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        instructorOrOrganization: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        level: {
            type: String,
            trim: true,
            index: true,
        },
        mode: {
            type: String,
            enum: ['live', 'recorded', 'self_paced'],
            trim: true,
        },
        duration: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            min: 0,
            default: 0,
        },
        subjects: [
            {
                type: String,
                trim: true,
            },
        ],
        certificateAvailability: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
        },
        schedule: {
            type: String,
            trim: true,
        },
        enrollmentLink: {
            type: String,
            trim: true,
        },
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

const OnlineClass = model('OnlineClass', onlineClassSchema);

export { OnlineClass };