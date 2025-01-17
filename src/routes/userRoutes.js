const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser } = require('../middleware/validateUser');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, verifyAdmin);
router.get('/', userController.getAllUsers);
router.get('/:code', userController.getUserByCode);
router.post('/', validateCreateUser, userController.createUser);
router.put('/:code', userController.updateUser);
router.delete('/:code', userController.deleteUser);

module.exports = router;