// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);
router.put('/:code', verifyToken, verifyAdmin, categoryController.updateCategory);
router.delete('/:code', verifyToken, verifyAdmin, categoryController.deleteCategory);

// Routes accessible to all authenticated users
router.get('/', verifyToken, categoryController.getAllCategories);
router.get('/:code', verifyToken, categoryController.getCategoryByCode);

module.exports = router;