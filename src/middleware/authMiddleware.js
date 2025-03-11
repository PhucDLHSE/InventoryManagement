const jwt = require('jsonwebtoken');
const { ROLE_TYPES } = require('../constants/roles');
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Xác thực token
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    //"Bearer <token>"
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  
    next();
  } catch (error) {
    console.error('Token lỗi:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Kiểm tra quyền Admin
exports.verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  if (req.user.role === ROLE_TYPES.ADMIN) {
    return next();
  }
  next('route');
};

// Kiểm tra quyền Manager
exports.verifyManager = (req, res, next) => {
  console.log("Kiểm tra quyền:", req.user);

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Không được phép truy cập" });
  }

  if (req.user.role === ROLE_TYPES.ADMIN || req.user.role === ROLE_TYPES.MANAGER) {
    return next();
  }

  return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện hành động này" });
};

// Kiểm tra quyền Staff
exports.verifyStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }
  if (req.user.role === ROLE_TYPES.STAFF) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Bạn không có quyền thực hiện hành động này'
  });
};

exports.verifyWarehouseAssigned = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  if (!req.user.warehouseCode) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chưa được gán vào kho nào'
    });
  }

  next();
};

//Only Admin
exports.onlyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  if (req.user.role === ROLE_TYPES.ADMIN) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Chỉ Admin mới có quyền thực hiện hành động này'
  });
};