const { USER_MESSAGES } = require('../constants/messages');
const { sendResponse } = require('../utils/responseHandler');
const HTTP_STATUS = require('../utils/httpStatus');

const validateCreateUser = (req, res, next) => {
    const { role_id, user_name, fullName, email, password } = req.body;
  
    if (!role_id || !user_name || !fullName || !email || !password) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, USER_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, USER_MESSAGES.INVALID_EMAIL);
    }

    next();
};

module.exports = { validateCreateUser };