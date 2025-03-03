// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/search', productController.searchProducts);

// Admin/Manager-only routes
router.post('/', verifyToken, verifyAdmin, productController.createProduct);
router.put('/:code', verifyToken, verifyAdmin, productController.updateProduct);
router.delete('/:code', verifyToken, verifyAdmin, productController.deleteProduct);
router.put('/:code/stock', verifyToken, verifyAdmin, productController.updateProductStock);

// Routes accessible to all authenticated users
router.get('/', verifyToken, productController.getAllProducts);
router.get('/:code', verifyToken, productController.getProductByCode);
router.get('/product-type/:productTypeCode', verifyToken, productController.getProductsByProductType);
router.get('/category/:categoryCode', verifyToken, productController.getProductsByCategory);

module.exports = router;