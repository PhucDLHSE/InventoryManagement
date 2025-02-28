const User = require('../models/userModel');
const { USER_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
    getAllUsers: asyncHandler(async (req, res) => {
        const users = await User.getAll();
        console.log('Get all users successful');
        return sendResponse(res, HTTP_STATUS.OK, true, USER_MESSAGES.GET_ALL_SUCCESS, users);
    }),

    getUserByCode: asyncHandler(async (req, res) => {
        const user = await User.getByCode(req.params.code);
        if (!user) {
            console.log(`User not found with code: ${req.params.code}`);
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, USER_MESSAGES.USER_NOT_FOUND);
        }
        console.log(`Get user successful: ${req.params.code}`);
        return sendResponse(res, HTTP_STATUS.OK, true, USER_MESSAGES.GET_USER_SUCCESS, user);
    }),

    createUser: asyncHandler(async (req, res) => {
        const result = await User.create(req.body);
        console.log(`Create user successful: ${result.user_code}`);
        return sendResponse(res, HTTP_STATUS.CREATED, true, USER_MESSAGES.CREATE_SUCCESS, result);
    }),

    updateUser: asyncHandler(async (req, res) => {
        if (req.body.user_name) {
            console.log(`Attempt to change username for user: ${req.params.code}`);
            return sendResponse(
                res, 
                HTTP_STATUS.BAD_REQUEST, 
                false, 
                USER_MESSAGES.USERNAME_CHANGE_NOT_ALLOWED
            );
        }

        const updatedUser = await User.update(req.params.code, req.body);
        console.log(`Update user successful: ${req.params.code}`);
        return sendResponse(
            res, 
            HTTP_STATUS.OK, 
            true, 
            USER_MESSAGES.UPDATE_SUCCESS, 
            updatedUser
        );
    }),

    deleteUser: asyncHandler(async (req, res) => {
        const deletedUser = await User.delete(req.params.code);
        console.log(`Delete user successful: ${req.params.code}`);
        return sendResponse(
            res, 
            HTTP_STATUS.OK, 
            true, 
            USER_MESSAGES.DELETE_SUCCESS, 
            deletedUser
        );
    })
};

module.exports = userController;