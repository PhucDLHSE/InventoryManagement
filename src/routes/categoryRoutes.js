const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyManager, categoryController.createCategory);
router.put('/:code', verifyToken, verifyManager, categoryController.updateCategory);
router.delete('/:code', verifyToken, verifyManager, categoryController.deleteCategory);


router.get('/', verifyToken, categoryController.getAllCategories);
router.get('/:code', verifyToken, categoryController.getCategoryByCode);

module.exports = router;