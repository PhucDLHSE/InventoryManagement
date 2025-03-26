const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Khóa bí mật (phải giống với Java)
const JWT_SECRET = process.env.JWT_SECRET || 'eaRge+NAiFb7HQITA/QcCaDmS7QXJlwy7UpOAJj5/ddqoWCYQquoPXkget8OK+zA';

// Chuyển khóa thành Buffer để dùng với jose
const secretKeyBuffer = Buffer.from(JWT_SECRET, 'utf8');

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    }
    if (!user.role_type) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản không có quyền truy cập'
      });
    }

    // Tải jose bằng import() động
    const { SignJWT } = await import('jose');

    // Tạo JWT token bằng jose
    const iat = Math.floor(Date.now() / 1000); 
    const exp = iat + (24 * 60 * 60); // Hết hạn sau 24 giờ

    const token = await new SignJWT({
      userId: user.user_id,
      userCode: user.user_code,
      role: user.role_type, 
      username: user.user_name,
      warehouseCode: user.warehouse_code,
      iat: iat,
      exp: exp
    })
      .setProtectedHeader({ alg: 'HS512', typ: 'JWT' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(secretKeyBuffer);

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