import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const educationEntrySchema = new Schema(
    {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        gradeOrScore: { type: String, trim: true },
    },
    { _id: false }
);

const experienceEntrySchema = new Schema(
    {
        title: { type: String, trim: true },
        organization: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String, trim: true },
    },
    { _id: false }
);

const projectEntrySchema = new Schema(
    {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        link: { type: String, trim: true },
    },
    { _id: false }
);

const certificationEntrySchema = new Schema(
    {
        name: { type: String, trim: true },
        issuer: { type: String, trim: true },
        date: { type: Date },
        link: { type: String, trim: true },
    },
    { _id: false }
);

const cvSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        personalDetails: {
            type: Schema.Types.Mixed,
            default: {},
        },
        educationEntries: [educationEntrySchema],
        skillList: [
            {
                type: String,
                trim: true,
            },
        ],
        experienceEntries: [experienceEntrySchema],
        projectEntries: [projectEntrySchema],
        certifications: [certificationEntrySchema],
        languages: [
            {
                type: String,
                trim: true,
            },
        ],
        templatePreference: {
            type: String,
            trim: true,
        },
        publicShareStatus: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const CV = model('CV', cvSchema);

export { CV };