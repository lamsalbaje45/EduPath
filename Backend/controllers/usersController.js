import { User } from '../models/user.js';
import { buildPaginationMetadata, buildUserQuery } from '../services/queryBuilders.js';

import { asyncHandler, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const getMyAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'Account retrieved successfully.', data: user });
});

const updateMyAccount = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { fullName, phoneNumber, profileImage } },
        { new: true, runValidators: true, omitUndefined: true }
    );

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'Account updated successfully.', data: user });
});

const listUsers = asyncHandler(async (req, res) => {
    const query = buildUserQuery(req.query);

    const [users, total] = await Promise.all([
        User.find(query.filter).sort(query.sort).skip(query.pagination.skip).limit(query.pagination.limit),
        User.countDocuments(query.filter),
    ]);

    return sendPaginated(res, {
        message: 'Users retrieved successfully.',
        data: users,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'User retrieved successfully.', data: user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { accountStatus: req.body.accountStatus } },
        { new: true, runValidators: true }
    );

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'User status updated successfully.', data: user });
});

const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { role: req.body.role } },
        { new: true, runValidators: true }
    );

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'User role updated successfully.', data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return sendError(res, { status: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'User deleted successfully.' });
});

export {
    deleteUser,
    getMyAccount,
    getUserById,
    listUsers,
    updateMyAccount,
    updateUserRole,
    updateUserStatus,
};
