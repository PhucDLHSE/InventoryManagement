const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng nhập người dùng
 *     description: API để đăng nhập và nhận JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên đăng nhập của người dùng
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     user_code:
 *                       type: string
 *                     user_name:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     status:
 *                       type: string
 *                     role_id:
 *                       type: string
 *                     role_name:
 *                       type: string
 *                     role_type:
 *                       type: string
 *       400:
 *         description: Thiếu thông tin đăng nhập
 *       401:
 *         description: Thông tin đăng nhập không chính xác
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: Lấy thông tin chi tiết của người dùng đã đăng nhập
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     user_code:
 *                       type: string
 *                     user_name:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     status:
 *                       type: string
 *                     role_id:
 *                       type: string
 *                     role_name:
 *                       type: string
 *                     role_type:
 *                       type: string
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thông tin người dùng
 */
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;