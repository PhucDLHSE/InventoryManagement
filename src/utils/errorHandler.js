const HTTP_STATUS = require('./httpStatus');
const { USER_MESSAGES } = require('../constants/messages');
const { sendResponse } = require('./responseHandler');

const handleError = (res, error) => {
    console.error('Error:', error);

    switch (error.message) {
        case USER_MESSAGES.USER_NOT_FOUND:
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, false, error.message);
        case USER_MESSAGES.USERNAME_CHANGE_NOT_ALLOWED:
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.message);
        case USER_MESSAGES.LAST_ADMIN:
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.message);
        default:
            if (error.message.includes(USER_MESSAGES.WAREHOUSE_MANAGER_PREFIX)) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.message);
            }
            return sendResponse(res, HTTP_STATUS.SERVER_ERROR, false, error.message);
    }
};

module.exports = { handleError };