const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validateUser');
const { verifyToken, onlyAdmin } = require('../middleware/authMiddleware');


router.get('/', verifyToken, onlyAdmin ,userController.getAllUsers);
router.get('/:code', verifyToken, onlyAdmin, userController.getUserByCode);
router.post('/', validateCreateUser, userController.createUser);
router.put('/:code', verifyToken, onlyAdmin, validateUpdateUser, userController.updateUser);
router.delete('/:code', verifyToken, onlyAdmin, userController.deleteUser);
router.put('/:code/warehouse', verifyToken, onlyAdmin, validateUpdateUser, userController.updateUser);

module.exports = router