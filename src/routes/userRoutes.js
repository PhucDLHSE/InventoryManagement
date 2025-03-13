/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API xác thực người dùng
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Authentication]
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
 *                 description: Tên đăng nhập
 *               password:
 *                 type: string
 *                 description: Mật khẩu
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
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: USR001
 *                     username:
 *                       type: string
 *                       example: admin
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *       400:
 *         description: Thông tin đăng nhập không hợp lệ
 *       401:
 *         description: Tên đăng nhập hoặc mật khẩu không đúng
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: USR001
 *                     username:
 *                       type: string
 *                       example: admin
 *                     fullName:
 *                       type: string
 *                       example: Admin User
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *                     warehouse:
 *                       type: string
 *                       example: WH0001
 *       401:
 *         description: Không có quyền truy cập
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;