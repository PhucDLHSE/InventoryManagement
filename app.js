const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); 

// Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Inventory Management System API' });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Documentation cho ứng dụng của bạn',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Inventory Management System API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);


// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/warehouses', require('./src/routes/warehouseRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/product-types', require('./src/routes/productTypeRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error!',
    error: err.message
  });
});

// 404
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
  res.status(404).json({
    success: false,
    message: 'Invalid route'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = app;