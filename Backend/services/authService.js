/**
 * Authentication Service
 * Handles authentication-related business logic including password management,
 * token generation, and credential validation
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePasswords(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - Secret key for signing
 * @param {Object} options - JWT options
 * @returns {string} Signed JWT token
 */
export function generateToken(payload, secret, options = {}) {
    try {
        const defaultOptions = {
            expiresIn: '7d',
            ...options,
        };
        return jwt.sign(payload, secret, defaultOptions);
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token, secret) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
}

/**
 * Generate a password reset token
 * @returns {Object} Token and hash
 */
export function generatePasswordResetToken() {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        return {
            token,
            hash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };
    } catch (error) {
        console.error('Error generating password reset token:', error);
        throw error;
    }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors
 */
export function validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one digit');
    }

    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Generate email verification token
 * @returns {Object} Token and hash
 */
export function generateEmailVerificationToken() {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        return {
            token,
            hash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };
    } catch (error) {
        console.error('Error generating email verification token:', error);
        throw error;
    }
}

/**
 * Check if account is locked due to failed login attempts
 * @param {Object} user - User object
 * @returns {boolean} True if account is locked
 */
export function isAccountLocked(user) {
    if (!user.loginAttempts || user.loginAttempts < 5) {
        return false;
    }

    // Lock account for 15 minutes after 5 failed attempts
    if (user.lockUntil && new Date() < user.lockUntil) {
        return true;
    }

    return false;
}

/**
 * Increment login attempts for a user
 * @param {Object} user - User object
 * @returns {Object} Updated user object
 */
export function incrementLoginAttempts(user) {
    try {
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        return user;
    } catch (error) {
        console.error('Error incrementing login attempts:', error);
        throw error;
    }
}

/**
 * Reset login attempts for a user
 * @param {Object} user - User object
 * @returns {Object} Updated user object
 */
export function resetLoginAttempts(user) {
    try {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        return user;
    } catch (error) {
        console.error('Error resetting login attempts:', error);
        throw error;
    }
}
