const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
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
    const user = await User.findByUsernameWithPassword(user_name);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }
    const isPasswordValid = (password === user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // JWT token
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

    if (user.full_name) {
      user.fullName = user.full_name;
      delete user.full_name;
    }

    delete user.password;
    return res.status(200).json({
      success: true,
      token,
      user
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