const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Lấy JWT secret từ biến môi trường hoặc sử dụng mặc định
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

exports.login = async (req, res) => {
  try {
    // Sử dụng user_name từ request body
    const { user_name, password } = req.body;

    // Xác thực cần user_name và password
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp tên người dùng và mật khẩu'
      });
    }

    // Tìm người dùng theo user_name và lấy cả mật khẩu
    const user = await User.findByUsernameWithPassword(user_name);

    // Nếu không tìm thấy người dùng
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }


    // Xác thực mật khẩu (sử dụng so sánh trực tiếp vì mật khẩu đang lưu dạng plain text)
    const isPasswordValid = (password === user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        userCode: user.user_code,
        role: user.role_type,
        username: user.user_name,
        warehouseCode: user.warehouse_code
      },
      JWT_SECRET,
      { expiresIn: '24h' } 
    );

    // Chuyển đổi full_name thành fullName cho API consistency
    if (user.full_name) {
      user.fullName = user.full_name;
      delete user.full_name;
    }

    // Loại bỏ mật khẩu trước khi gửi về
    delete user.password;

    // Trả về token và thông tin người dùng
    return res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ'
    });
  }
};

// Phương thức lấy thông tin người dùng hiện tại từ token
exports.getCurrentUser = async (req, res) => {
  try {
    // Thông tin người dùng được đặt vào req.user bởi middleware xác thực
    const user = await User.getByCode(req.user.userCode);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    // Chuyển đổi full_name thành fullName cho API consistency
    if (user.full_name) {
      user.fullName = user.full_name;
      delete user.full_name;
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ'
    });
  }
};