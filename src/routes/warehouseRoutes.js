const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateCreateWarehouse } = require('../middleware/validateWarehouse');


// Admin-only 
router.post('/', verifyToken, verifyAdmin, warehouseController.createWarehouse);
router.put('/:code', verifyToken, verifyAdmin, warehouseController.updateWarehouse);
router.delete('/:code', verifyToken, verifyAdmin, warehouseController.deleteWarehouse);

// All users
router.get('/', warehouseController.getAllWarehouses);
router.get('/:code', verifyToken, warehouseController.getWarehouseByCode);

router.post('/', verifyToken, verifyAdmin, validateCreateWarehouse, warehouseController.createWarehouse);

router.get('/products/:code', verifyToken, warehouseController.getWarehouseProducts);

module.exports = router;