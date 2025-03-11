const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

// Admin, Manager
router.use(verifyToken);
router.post('/', verifyToken, verifyManager, productTypeController.createProductType);
router.put('/:code', verifyToken, verifyManager, productTypeController.updateProductType);
router.delete('/:code', verifyToken, verifyManager, productTypeController.deleteProductType);

// All users 
router.get('/',verifyToken, productTypeController.getAllProductTypes);
router.get('/:code', verifyToken, productTypeController.getProductTypeByCode);
router.get('/category/:categoryCode', verifyToken, productTypeController.getProductTypesByCategory);

module.exports = router;