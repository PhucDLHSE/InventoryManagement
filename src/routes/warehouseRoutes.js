// src/routes/warehouseRoutes.js
const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { validateCreateWarehouse } = require('../middleware/validateWarehouse');


// Admin-only routes
router.post('/', verifyToken, verifyAdmin, warehouseController.createWarehouse);
router.put('/:code', verifyToken, verifyAdmin, warehouseController.updateWarehouse);
router.delete('/:code', verifyToken, verifyAdmin, warehouseController.deleteWarehouse);

// Routes accessible to all authenticated users
router.get('/', verifyToken, warehouseController.getAllWarehouses);
router.get('/:code', verifyToken, warehouseController.getWarehouseByCode);

router.post('/', verifyToken, verifyAdmin, validateCreateWarehouse, warehouseController.createWarehouse);

module.exports = router;