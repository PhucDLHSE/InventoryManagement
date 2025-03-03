const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Khởi tạo app Express
const app = express();

// Cấu hình Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management API',
      version: '1.0.0',
      description: 'API hệ thống quản lý kho hàng'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Đường dẫn các tệp chứa JSDoc
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(cors()); // Cho phép cross-origin requests
app.use(helmet()); // Bảo mật HTTP headers
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/warehouses', require('./src/routes/warehouseRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/product-types', require('./src/routes/productTypeRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));

// Route mặc định
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Quản lý kho hàng',
    docs: '/api-docs'
  });
});

// Middleware log request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy endpoint'
  });
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Cổng máy chủ
const PORT = process.env.PORT || 8080;

console.log("⚡ API đã đăng ký:", app._router.stack.map(r => r.route?.path).filter(Boolean));

// Khởi động máy chủ
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});

module.exports = app;