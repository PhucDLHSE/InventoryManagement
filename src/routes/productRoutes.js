const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyManager, productController.createProduct);
router.patch('/:code', verifyToken, verifyManager, productController.updateProduct);
router.delete('/:code', verifyToken, verifyManager, productController.deleteProduct);

router.get('/search', verifyToken, productController.searchProducts);
router.get('/category/:category', verifyToken, productController.getProductByCategory);
router.get('/productType/:productType', verifyToken, productController.getProductByProductType);
router.get('/:code', verifyToken, productController.getProductByCode);
router.get('/', verifyToken, productController.getAllProducts);

router.get('/:code/locations', verifyToken, productController.getProductLocations);

module.exports = router;
