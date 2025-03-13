const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const path = require("path");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Warehouse Management API',
      version: '1.0.0',
      description: 'API quản lý kho hàng',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
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
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // đường dẫn đến các file routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors()); 
app.use(helmet()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/warehouses', require('./src/routes/warehouseRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/product-types', require('./src/routes/productTypeRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/exchange-notes', require('./src/routes/exchangeNoteRoutes'));

// Middleware log request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy API'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;