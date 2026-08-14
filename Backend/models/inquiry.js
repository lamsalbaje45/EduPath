import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const inquirySchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ['college', 'employer', 'instructor'],
            index: true,
        },
        targetRecord: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['new', 'read', 'replied', 'closed'],
            default: 'new',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Inquiry = model('Inquiry', inquirySchema);

export { Inquiry };