import { getJwtSecret } from '../middleware/auth.js';
import { User } from '../models/user.js';
import {
    comparePasswords,
    generatePasswordResetToken,
    generateToken,
    hashPassword,
    validatePasswordStrength,
} from '../services/authService.js';
import crypto from 'crypto';

import { asyncHandler, sendCreated, sendError, sendSuccess } from './controllerUtils.js';

function issueToken(user) {
    return generateToken({ id: user._id, role: user.role, email: user.email }, getJwtSecret());
}

function toSafeUser(user) {
    const plain = user.toObject ? user.toObject() : user;
    const { passwordHash, passwordResetToken, passwordResetExpiresAt, ...safeUser } = plain; // eslint-disable-line no-unused-vars
    return safeUser;
}

const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, phoneNumber, role } = req.body;

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
        return sendError(res, {
            status: 400,
            message: 'Password does not meet strength requirements.',
            errors: strength.errors.map((message) => ({ field: 'password', message })),
        });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        fullName,
        email,
        passwordHash,
        phoneNumber,
        role,
    });

    return sendCreated(res, {
        message: 'Account created successfully.',
        data: {
            user: toSafeUser(user),
            token: issueToken(user),
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

    if (!user) {
        return sendError(res, { status: 401, message: 'Invalid email or password.' });
    }

    if (user.accountStatus !== 'active') {
        return sendError(res, { status: 403, message: `Your account is ${user.accountStatus}. Please contact support.` });
    }

    const passwordMatches = await comparePasswords(password, user.passwordHash);

    if (!passwordMatches) {
        return sendError(res, { status: 401, message: 'Invalid email or password.' });
    }

    return sendSuccess(res, {
        message: 'Login successful.',
        data: {
            user: toSafeUser(user),
            token: issueToken(user),
        },
    });
});

const logout = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Logged out successfully. Discard the token on the client.',
}));

const getCurrentUser = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Current authenticated user',
    data: req.user,
    user: req.user,
}));

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+passwordHash');

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    const currentMatches = await comparePasswords(currentPassword, user.passwordHash);

    if (!currentMatches) {
        return sendError(res, { status: 401, message: 'Current password is incorrect.' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
        return sendError(res, {
            status: 400,
            message: 'Password does not meet strength requirements.',
            errors: strength.errors.map((message) => ({ field: 'newPassword', message })),
        });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return sendSuccess(res, { message: 'Password changed successfully.' });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        return sendSuccess(res, {
            message: 'If an account with that email exists, a password reset token has been issued.',
        });
    }

    const { token, hash, expiresAt } = generatePasswordResetToken();

    user.passwordResetToken = hash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    return sendSuccess(res, {
        message: 'If an account with that email exists, a password reset token has been issued.',
        data: { resetToken: token, expiresAt },
    });
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hash,
        passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpiresAt');

    if (!user) {
        return sendError(res, { status: 400, message: 'Reset token is invalid or has expired.' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
        return sendError(res, {
            status: 400,
            message: 'Password does not meet strength requirements.',
            errors: strength.errors.map((message) => ({ field: 'newPassword', message })),
        });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Password reset successfully. You can now log in with your new password.' });
});

export {
    changePassword,
    confirmPasswordReset,
    getCurrentUser,
    login,
    logout,
    register,
    requestPasswordReset,
};
