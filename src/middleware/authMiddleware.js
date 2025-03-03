const jwt = require('jsonwebtoken');
const { ROLE_TYPES } = require('../constants/roles');

// Lấy JWT secret từ biến môi trường hoặc sử dụng mặc định
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Middleware xác thực token
exports.verifyToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Lấy token từ header "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Đặt thông tin người dùng vào req để sử dụng trong các middleware và controller
    req.user = decoded;
    
    // Tiếp tục xử lý request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
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

// Middleware kiểm tra quyền Admin
exports.verifyAdmin = (req, res, next) => {
  // Kiểm tra xem middleware trước đó đã xác thực token chưa
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  // Kiểm tra quyền Admin
  if (req.user.role === ROLE_TYPES.ADMIN) {
    return next();
  }

  // Nếu không phải Admin, chuyển đến middleware tiếp theo
  // (có thể là verifyManager hoặc controller nếu API cần quyền admin HOẶC manager)
  next('route');
};

// Middleware kiểm tra quyền Manager
exports.verifyManager = (req, res, next) => {
  // Kiểm tra xem middleware trước đó đã xác thực token chưa
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  // Kiểm tra quyền Manager
  if (req.user.role === ROLE_TYPES.MANAGER) {
    return next();
  }

  // Nếu không phải Manager, trả về lỗi 403 Forbidden
  return res.status(403).json({
    success: false,
    message: 'Bạn không có quyền thực hiện hành động này'
  });
};

// Middleware kiểm tra quyền Staff
exports.verifyStaff = (req, res, next) => {
  // Kiểm tra xem middleware trước đó đã xác thực token chưa
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  // Kiểm tra quyền Staff
  if (req.user.role === ROLE_TYPES.STAFF) {
    return next();
  }

  // Nếu không phải Staff, trả về lỗi 403 Forbidden
  return res.status(403).json({
    success: false,
    message: 'Bạn không có quyền thực hiện hành động này'
  });
};

// Middleware kiểm tra người dùng đã được gán vào kho chưa
exports.verifyWarehouseAssigned = (req, res, next) => {
  // Kiểm tra xem middleware trước đó đã xác thực token chưa
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không được phép truy cập'
    });
  }

  // Thực tế sẽ cần truy vấn database để kiểm tra xem người dùng đã được gán warehouse_code chưa
  // Trong middleware này giả định thông tin warehouse_code đã nằm trong token
  // Nếu không, bạn cần query từ database

  if (!req.user.warehouseCode) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chưa được gán vào kho nào'
    });
  }

  next();
};