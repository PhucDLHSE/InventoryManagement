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
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "123456"
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
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: "U1"
 *                     user_code:
 *                       type: string
 *                       example: "DF0001"
 *                     role_id:
 *                       type: string
 *                       example: "AD"
 *                     user_name:
 *                       type: string
 *                       example: "admin"
 *                     email:
 *                       type: string
 *                       example: "admin@gmail.com"
 *                     warehouse_code:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: "inactive"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-07T15:51:39.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-07T15:51:39.000Z"
 *                     role_name:
 *                       type: string
 *                       example: "Admin"
 *                     role_type:
 *                       type: string
 *                       example: "ADMIN"
 *                     warehouse_name:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     address:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     fullName:
 *                       type: string
 *                       example: "Hoang Phuc"
 *       400:
 *         description: Thông tin đăng nhập không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Thông tin đăng nhập không hợp lệ"
 *       401:
 *         description: Tên đăng nhập hoặc mật khẩu không đúng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Tên đăng nhập hoặc mật khẩu không đúng"
 */


/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại từ token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng từ token
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
 *                       example: "U1"
 *                     user_code:
 *                       type: string
 *                       example: "DF0001"
 *                     user_name:
 *                       type: string
 *                       example: "admin"
 *                     email:
 *                       type: string
 *                       example: "admin@gmail.com"
 *                     warehouse_code:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: "inactive"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-07T15:51:39.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-07T15:51:39.000Z"
 *                     role_id:
 *                       type: string
 *                       example: "AD"
 *                     role_name:
 *                       type: string
 *                       example: "Admin"
 *                     role_type:
 *                       type: string
 *                       example: "ADMIN"
 *                     warehouse_name:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     address:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     fullName:
 *                       type: string
 *                       example: "Hoang Phuc"
 *       401:
 *         description: Người dùng chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token không hợp lệ hoặc đã hết hạn"
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
