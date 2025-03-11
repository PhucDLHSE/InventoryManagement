const { USER_MESSAGES } = require('../constants/messages');
const { ROLE_TYPES } = require('../constants/roles');

exports.validateCreateUser = (req, res, next) => {
  try {
    const { role_type, user_name, full_name, email, password } = req.body;
    if (!role_type || !user_name || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.MISSING_FIELDS
      });
    }
    //Định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.INVALID_EMAIL
      });
    }
    if (!Object.values(ROLE_TYPES).includes(role_type)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.ROLE_TYPE_INVALID
      });
    }
    next();
  } catch (error) {
    console.error('Validate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

exports.validateUpdateUser = (req, res, next) => {
  try {
    const { full_name, email, password, warehouse_code } = req.body;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: USER_MESSAGES.INVALID_EMAIL
        });
      }
    }
    if (!full_name && !email && !password && warehouse_code === undefined) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.NO_UPDATE_DATA
      });
    }
    next();
  } catch (error) {
    console.error('Validate update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực cập nhật người dùng'
    });
  }
};

exports.validateCreateUser = (req, res, next) => {
  try {
    const { role_type, user_name, full_name, email, password } = req.body;

    if (!role_type || !user_name || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.MISSING_FIELDS
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.INVALID_EMAIL
      });
    }
    if (!Object.values(ROLE_TYPES).includes(role_type)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.ROLE_TYPE_INVALID
      });
    }
    next();
  } catch (error) {
    console.error('Validate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

exports.validateUpdateUser = (req, res, next) => {
  try {
    const { full_name, email, password, warehouse_code } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: USER_MESSAGES.INVALID_EMAIL
        });
      }
    }

    if (!full_name && !email && !password && warehouse_code === undefined) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.NO_UPDATE_DATA
      });
    }
    next();
  } catch (error) {
    console.error('Validate update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực cập nhật người dùng'
    });
  }
};