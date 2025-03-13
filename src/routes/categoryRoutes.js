/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         category_id:
 *           type: string
 *           example: 72a66c72-f152-4818-aefb-dc4b68e8e7d3
 *         category_code:
 *           type: string
 *           example: ao_dai
 *         category_name:
 *           type: string
 *           example: Áo dài
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API quản lý danh mục sản phẩm
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/categories/{code}:
 *   get:
 *     summary: Lấy thông tin danh mục theo mã
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã danh mục
 *     responses:
 *       200:
 *         description: Thông tin danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Áo dài
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/categories/{code}:
 *   put:
 *     summary: Cập nhật thông tin danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã danh mục
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Áo dài
 *     responses:
 *       200:
 *         description: Thông tin danh mục đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy danh mục
 */

/**
 * @swagger
 * /api/categories/{code}:
 *   delete:
 *     summary: Xóa danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã danh mục
 *     responses:
 *       200:
 *         description: Danh mục đã được xóa
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
 *                   example: Xóa danh mục thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy danh mục
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyManager, categoryController.createCategory);
router.put('/:code', verifyToken, verifyManager, categoryController.updateCategory);
router.delete('/:code', verifyToken, verifyManager, categoryController.deleteCategory);

router.get('/', categoryController.getAllCategories);
router.get('/:code', verifyToken, categoryController.getCategoryByCode);

module.exports = router;