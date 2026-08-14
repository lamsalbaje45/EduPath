import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const applicationSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        opportunity: {
            type: Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
            index: true,
        },
        cvReference: {
            type: Schema.Types.ObjectId,
            ref: 'CV',
        },
        cvSnapshot: {
            type: Schema.Types.Mixed,
        },
        coverMessage: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['draft', 'submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
            default: 'submitted',
            index: true,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        employerNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Application = model('Application', applicationSchema);

export { Application };