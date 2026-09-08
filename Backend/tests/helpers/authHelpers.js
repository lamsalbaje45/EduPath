import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { getJwtSecret } from '../../middleware/auth.js';
import { ROLES } from '../../config/roles.js';
import { hashPassword } from '../../services/authService.js';
import { User } from '../../models/user.js';

const DEFAULT_PASSWORD = 'Sup3rSecret!';

function uniqueEmail(prefix = 'user') {
    return `${prefix}-${new mongoose.Types.ObjectId().toString()}@example.com`;
}

async function createUser({
    role = ROLES.STUDENT,
    fullName = 'Test User',
    email,
    password = DEFAULT_PASSWORD,
    accountStatus = 'active',
    ...rest
} = {}) {
    const passwordHash = await hashPassword(password);

    return User.create({
        fullName,
        email: email || uniqueEmail(role),
        passwordHash,
        role,
        accountStatus,
        ...rest,
    });
}

function issueTokenFor(user) {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        getJwtSecret(),
        { expiresIn: '1h' }
    );
}

async function createAuthenticatedUser(options) {
    const user = await createUser(options);
    const token = issueTokenFor(user);

    return { user, token };
}

function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}

export { authHeader, createAuthenticatedUser, createUser, issueTokenFor, uniqueEmail };
