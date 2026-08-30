/**
 * File Upload Service
 * Handles file uploads, validation, and management
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB default
const ALLOWED_MIME_TYPES = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/quicktime'],
};

/**
 * Initialize upload directories
 * @returns {Promise<void>}
 */
export async function initializeUploadDirs() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.mkdir(path.join(UPLOAD_DIR, 'cvs'), { recursive: true });
        await fs.mkdir(path.join(UPLOAD_DIR, 'profiles'), { recursive: true });
        await fs.mkdir(path.join(UPLOAD_DIR, 'documents'), { recursive: true });
    } catch (error) {
        console.error('Error initializing upload directories:', error);
        throw error;
    }
}

/**
 * Validate file upload
 * @param {Object} file - File object from express/multer
 * @param {string} fileType - Type of file (pdf, image, video, etc.)
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
export function validateFile(file, fileType = 'pdf', maxSize = MAX_FILE_SIZE) {
    const errors = [];

    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }

    if (file.size > maxSize) {
        errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    const allowedMimes = ALLOWED_MIME_TYPES[fileType];
    if (allowedMimes) {
        const mimeArray = Array.isArray(allowedMimes) ? allowedMimes : [allowedMimes];
        if (!mimeArray.includes(file.mimetype)) {
            errors.push(`File type not allowed. Allowed types: ${mimeArray.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Generate unique filename
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique filename with timestamp and hash
 */
export function generateUniqueFilename(originalFilename) {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    return `${name}-${timestamp}-${hash}${ext}`;
}

/**
 * Upload CV file
 * @param {Object} file - File object from express/multer
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<Object>} Upload result with file path and URL
 */
export async function uploadCV(file, userId) {
    try {
        const validation = validateFile(file, 'pdf', 10 * 1024 * 1024); // 10MB for CVs
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const filename = generateUniqueFilename(file.originalname);
        const filepath = path.join(UPLOAD_DIR, 'cvs', userId, filename);
        const dirpath = path.dirname(filepath);

        // Create user directory if it doesn't exist
        await fs.mkdir(dirpath, { recursive: true });

        // Save file
        await fs.writeFile(filepath, file.buffer);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/cvs/${userId}/${filename}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    } catch (error) {
        console.error('Error uploading CV:', error);
        throw error;
    }
}

/**
 * Upload profile image
 * @param {Object} file - File object from express/multer
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<Object>} Upload result
 */
export async function uploadProfileImage(file, userId) {
    try {
        const validation = validateFile(file, 'image', 2 * 1024 * 1024); // 2MB for images
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const filename = generateUniqueFilename(file.originalname);
        const filepath = path.join(UPLOAD_DIR, 'profiles', userId, filename);
        const dirpath = path.dirname(filepath);

        // Create user directory if it doesn't exist
        await fs.mkdir(dirpath, { recursive: true });

        // Save file
        await fs.writeFile(filepath, file.buffer);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/profiles/${userId}/${filename}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
}

/**
 * Upload document file
 * @param {Object} file - File object from express/multer
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<Object>} Upload result
 */
export async function uploadDocument(file, userId) {
    try {
        const validation = validateFile(file, 'doc', 10 * 1024 * 1024); // 10MB
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const filename = generateUniqueFilename(file.originalname);
        const filepath = path.join(UPLOAD_DIR, 'documents', userId, filename);
        const dirpath = path.dirname(filepath);

        // Create user directory if it doesn't exist
        await fs.mkdir(dirpath, { recursive: true });

        // Save file
        await fs.writeFile(filepath, file.buffer);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/documents/${userId}/${filename}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
}

/**
 * Delete file
 * @param {string} filepath - File path to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFile(filepath) {
    try {
        const fullPath = path.join(UPLOAD_DIR, filepath);
        await fs.unlink(fullPath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

/**
 * Get file info
 * @param {string} filepath - File path
 * @returns {Promise<Object>} File information
 */
export async function getFileInfo(filepath) {
    try {
        const fullPath = path.join(UPLOAD_DIR, filepath);
        const stats = await fs.stat(fullPath);
        return {
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            isFile: stats.isFile(),
        };
    } catch (error) {
        console.error('Error getting file info:', error);
        throw error;
    }
}

/**
 * List files for a user in a category
 * @param {string} userId - User ID
 * @param {string} category - File category (cvs, profiles, documents)
 * @returns {Promise<Array>} Array of file information
 */
export async function listUserFiles(userId, category) {
    try {
        const dirpath = path.join(UPLOAD_DIR, category, userId);
        await fs.mkdir(dirpath, { recursive: true });

        const files = await fs.readdir(dirpath);
        return files;
    } catch (error) {
        console.error('Error listing user files:', error);
        throw error;
    }
}
