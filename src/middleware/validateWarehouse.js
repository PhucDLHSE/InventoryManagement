const { WAREHOUSE_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');

const validateCreateWarehouse = (req, res, next) => {
  const { warehouse_name, address } = req.body;
  
  if (!warehouse_name || !address) {
    return sendResponse(
      res, 
      HTTP_STATUS.BAD_REQUEST, 
      false, 
      WAREHOUSE_MESSAGES.MISSING_FIELDS
    );
  }
  
  next();
};

module.exports = { validateCreateWarehouse };