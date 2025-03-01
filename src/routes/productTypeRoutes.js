// src/routes/productTypeRoutes.js
const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, productTypeController.createProductType);
router.put('/:code', verifyToken, verifyAdmin, productTypeController.updateProductType);
router.delete('/:code', verifyToken, verifyAdmin, productTypeController.deleteProductType);

// Routes accessible to all authenticated users
router.get('/', verifyToken, productTypeController.getAllProductTypes);
router.get('/:code', verifyToken, productTypeController.getProductTypeByCode);
router.get('/category/:categoryCode', verifyToken, productTypeController.getProductTypesByCategory);

module.exports = router;