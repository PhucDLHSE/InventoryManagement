const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validateUser');
const { verifyToken, onlyAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(onlyAdmin);

router.get('/', verifyToken, onlyAdmin ,userController.getAllUsers);
router.get('/:code', onlyAdmin, userController.getUserByCode);
router.post('/', onlyAdmin, validateCreateUser, userController.createUser);
router.put('/:code', onlyAdmin, validateUpdateUser, userController.updateUser);
router.delete('/:code', onlyAdmin, userController.deleteUser);
router.put('/:code/warehouse', onlyAdmin, validateUpdateUser, userController.updateUser);

module.exports = router