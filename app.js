const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

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

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

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