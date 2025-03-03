// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/search', productController.searchProducts);

// CRUD for products
router.post('/', verifyToken, verifyAdmin, productController.createProduct);
router.put('/:code', verifyToken, verifyAdmin, productController.updateProduct);
router.delete('/:code', verifyToken, verifyAdmin, productController.deleteProduct);
router.put('/:code/stock', verifyToken, verifyAdmin, productController.updateProductStock);

// Get products by different criteria
router.get('/', productController.getAllProducts);
router.get('/:code', productController.getProductByCode);
router.get('/product-type/:productTypeCode', productController.getProductsByProductType);
router.get('/category/:categoryCode', productController.getProductsByCategory);

module.exports = router;