/**
 * Notification Service
 * Handles sending emails and in-app notifications to users
 */

import nodemailer from 'nodemailer';

// Create reusable transporter (configure with your email service)
const createEmailTransporter = () => {
    // TODO: Configure with your email service (Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send a welcome email to a new user
 * @param {string} email - User email address
 * @param {string} fullName - User full name
 * @returns {Promise<Object>} Email send result
 */
export async function sendWelcomeEmail(email, fullName) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Welcome to EduPath!',
            html: `
                <h1>Welcome to EduPath, ${fullName}!</h1>
                <p>We're excited to have you join our community.</p>
                <p>Explore opportunities and educational resources tailored for you.</p>
                <p>Best regards,<br>The EduPath Team</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}

/**
 * Send email verification email
 * @param {string} email - User email address
 * @param {string} verificationLink - Email verification link
 * @returns {Promise<Object>} Email send result
 */
export async function sendEmailVerification(email, verificationLink) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <h2>Email Verification Required</h2>
                <p>Click the link below to verify your email address:</p>
                <p><a href="${verificationLink}">Verify Email</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create this account, please ignore this email.</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email verification:', error);
        throw error;
    }
}

/**
 * Send password reset email
 * @param {string} email - User email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise<Object>} Email send result
 */
export async function sendPasswordResetEmail(email, resetLink) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
}

/**
 * Send opportunity application notification
 * @param {string} email - Recipient email
 * @param {string} opportunityTitle - Opportunity title
 * @returns {Promise<Object>} Email send result
 */
export async function sendApplicationConfirmation(email, opportunityTitle) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Application Submitted Successfully',
            html: `
                <h2>Application Submitted</h2>
                <p>Your application for <strong>${opportunityTitle}</strong> has been submitted successfully.</p>
                <p>You will be notified when the opportunity provider reviews your application.</p>
                <p>Best regards,<br>The EduPath Team</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending application confirmation:', error);
        throw error;
    }
}

/**
 * Send inquiry response email
 * @param {string} email - Recipient email
 * @param {string} response - Response message
 * @returns {Promise<Object>} Email send result
 */
export async function sendInquiryResponse(email, response) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Your Inquiry Has Been Answered',
            html: `
                <h2>Response to Your Inquiry</h2>
                <p>${response}</p>
                <p>If you have further questions, please don't hesitate to reach out.</p>
                <p>Best regards,<br>The EduPath Team</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending inquiry response:', error);
        throw error;
    }
}

/**
 * Send new opportunity notification to interested students
 * @param {string} email - Student email
 * @param {string} opportunityTitle - Opportunity title
 * @returns {Promise<Object>} Email send result
 */
export async function sendNewOpportunityNotification(email, opportunityTitle) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'New Opportunity Matching Your Interests',
            html: `
                <h2>New Opportunity Available</h2>
                <p>A new opportunity matching your interests has been posted:</p>
                <p><strong>${opportunityTitle}</strong></p>
                <p><a href="${process.env.APP_URL}/opportunities">View Opportunities</a></p>
                <p>Best regards,<br>The EduPath Team</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending opportunity notification:', error);
        throw error;
    }
}

/**
 * Send account suspension notification
 * @param {string} email - User email
 * @param {string} reason - Reason for suspension
 * @returns {Promise<Object>} Email send result
 */
export async function sendAccountSuspensionNotice(email, reason) {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@edupath.com',
            to: email,
            subject: 'Account Suspension Notice',
            html: `
                <h2>Account Suspension</h2>
                <p>Your account has been suspended due to the following reason:</p>
                <p>${reason}</p>
                <p>If you believe this is a mistake, please contact our support team.</p>
                <p>Best regards,<br>The EduPath Team</p>
            `,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending account suspension notice:', error);
        throw error;
    }
}
