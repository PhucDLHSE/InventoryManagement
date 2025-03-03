const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/:warehouse_code', stockController.getStockByWarehouse);
router.post('/add', stockController.addStock);
router.post('/change-warehouse', stockController.changeStockWarehouse);
router.put('/update', stockController.updateStock);

module.exports = router;
