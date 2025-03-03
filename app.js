const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

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
app.use('/api/stocks', require('./src/routes/stockRoutes'));
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
  console.log(`Port ${PORT}`);
});

module.exports = app;