const { ROLE_TYPES } = require('../constants/roles');

// Khóa bí mật (phải giống với Java)
const JWT_SECRET = process.env.JWT_SECRET || 'eaRge+NAiFb7HQITA/QcCaDmS7QXJlwy7UpOAJj5/ddqoWCYQquoPXkget8OK+zA';

// Chuyển khóa thành Buffer để dùng với jose
const secretKeyBuffer = Buffer.from(JWT_SECRET, 'utf8');

// Xác thực token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Tải jose bằng import() động
    const { jwtVerify } = await import('jose');

    // Xác thực token bằng jose
    const { payload } = await jwtVerify(token, secretKeyBuffer, {
      algorithms: ['HS512']
    });

    req.user = payload; 
    next();
  } catch (error) {
    console.error('Token lỗi:', error);

    if (error.code === 'ERR_JWT_EXPIRED') {
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

// Kiểm tra xem user có được gán kho hay không
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

// Chỉ cho phép Admin
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