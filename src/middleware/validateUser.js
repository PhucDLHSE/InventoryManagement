const { USER_MESSAGES } = require('../constants/messages');
const { ROLE_TYPES } = require('../constants/roles');

// Xác thực dữ liệu khi tạo người dùng mới
exports.validateCreateUser = (req, res, next) => {
  try {
    // Sửa lại để kiểm tra các trường đúng với request body
    const { role_type, user_name, full_name, email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!role_type || !user_name || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.MISSING_FIELDS
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.INVALID_EMAIL
      });
    }

    // Kiểm tra role_type hợp lệ
    if (!Object.values(ROLE_TYPES).includes(role_type)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.ROLE_TYPE_INVALID
      });
    }

    // Mã hóa mật khẩu (nếu cần)
    // Điều này có thể được thực hiện trong model, tùy thuộc vào thiết kế

    // Chuyển đến middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    console.error('Validate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

// Xác thực dữ liệu khi cập nhật người dùng
exports.validateUpdateUser = (req, res, next) => {
  try {
    const { full_name, email, password, warehouse_code } = req.body;

    // Kiểm tra định dạng email nếu có
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: USER_MESSAGES.INVALID_EMAIL
        });
      }
    }

    // Mã hóa mật khẩu (nếu cần)
    // Điều này có thể được thực hiện trong model, tùy thuộc vào thiết kế

    // Kiểm tra xem có dữ liệu cập nhật không
    if (!full_name && !email && !password && warehouse_code === undefined) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.NO_UPDATE_DATA
      });
    }

    // Chuyển đến middleware hoặc controller tiếp theo
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
    // Sửa lại để kiểm tra các trường đúng với request body
    const { role_type, user_name, full_name, email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!role_type || !user_name || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.MISSING_FIELDS
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.INVALID_EMAIL
      });
    }

    // Kiểm tra role_type hợp lệ
    if (!Object.values(ROLE_TYPES).includes(role_type)) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.ROLE_TYPE_INVALID
      });
    }

    // Mã hóa mật khẩu (nếu cần)
    // Điều này có thể được thực hiện trong model, tùy thuộc vào thiết kế

    // Chuyển đến middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    console.error('Validate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

// Xác thực dữ liệu khi cập nhật người dùng
exports.validateUpdateUser = (req, res, next) => {
  try {
    const { full_name, email, password, warehouse_code } = req.body;

    // Kiểm tra định dạng email nếu có
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: USER_MESSAGES.INVALID_EMAIL
        });
      }
    }

    // Mã hóa mật khẩu (nếu cần)
    // Điều này có thể được thực hiện trong model, tùy thuộc vào thiết kế

    // Kiểm tra xem có dữ liệu cập nhật không
    if (!full_name && !email && !password && warehouse_code === undefined) {
      return res.status(400).json({
        success: false,
        message: USER_MESSAGES.NO_UPDATE_DATA
      });
    }

    // Chuyển đến middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    console.error('Validate update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực cập nhật người dùng'
    });
  }
};