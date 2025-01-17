const { handleError } = require('./errorHandler');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => handleError(res, error));
};

module.exports = asyncHandler;