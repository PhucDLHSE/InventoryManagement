const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

exports.login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập username và password'
      });
    }

    // Tìm user theo username
    const user = await User.findByUsernameWithPassword(user_name);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // So sánh password sử dụng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Kiểm tra role_type (giả sử user có trường role_type)
    if (!user.role_type) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản không có quyền truy cập'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        userCode: user.user_code,
        role: user.role_type, // Sử dụng role_type thay vì role_id
        username: user.user_name,
        warehouseCode: user.warehouse_code
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Chuẩn hóa dữ liệu user trước khi trả về
    const userData = { ...user };
    delete userData.password;

    return res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.getByCode(req.user.userCode);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
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
