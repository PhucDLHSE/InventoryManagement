/**
 * @swagger
 * components:
 *   schemas:
 *     ProductType:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         productType_code:
 *           type: string
 *           example: PT0001
 *         productType_name:
 *           type: string
 *           example: Áo dài truyền thống
 *         price:
 *           type: integer
 *           example: 500000
 *         
 */

/**
 * @swagger
 * tags:
 *   name: Product Types
 *   description: API quản lý loại sản phẩm
 */

/**
 * @swagger
 * /api/product-types:
 *   get:
 *     summary: Lấy danh sách tất cả loại sản phẩm
 *     tags: [Product Types]
 *     responses:
 *       200:
 *         description: Danh sách loại sản phẩm
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
 *                     $ref: '#/components/schemas/ProductType'
 */

/**
 * @swagger
 * /api/product-types/{code}:
 *   get:
 *     summary: Lấy thông tin loại sản phẩm theo mã
 *     tags: [Product Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã loại sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin loại sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */

/**
 * @swagger
 * /api/product-types/category/{categoryCode}:
 *   get:
 *     summary: Lấy danh sách loại sản phẩm theo danh mục
 *     tags: [Product Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã danh mục
 *     responses:
 *       200:
 *         description: Danh sách loại sản phẩm
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
 *                     $ref: '#/components/schemas/ProductType'
 */

/**
 * @swagger
 * /api/product-types:
 *   post:
 *     summary: Tạo loại sản phẩm mới
 *     tags: [Product Types]
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
 *               - category
 *             properties:
 *               productType_name:
 *                 type: string
 *                 description: Tên loại sản phẩm
 *               price:
 *                 type: integer
 *                 description: Giá sản phẩm
 *               category_code:
 *                 type: string
 *                 description: Mã danh mục
 *     responses:
 *       201:
 *         description: Loại sản phẩm đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductType'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/product-types/{code}:
 *   put:
 *     summary: Cập nhật thông tin loại sản phẩm
 *     tags: [Product Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã loại sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productType_name:
 *                 type: string
 *                 description: Tên loại sản phẩm
 *               price:
 *                 type: integer
 *                 description: Giá sản phẩm
 *               category_code:
 *                 type: string
 *                 description: Mã danh mục
 *     responses:
 *       200:
 *         description: Thông tin loại sản phẩm đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductType'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */

/**
 * @swagger
 * /api/product-types/{code}:
 *   delete:
 *     summary: Xóa loại sản phẩm
 *     tags: [Product Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã loại sản phẩm
 *     responses:
 *       200:
 *         description: Loại sản phẩm đã được xóa
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
 *                   example: Xóa loại sản phẩm thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */

const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

// Admin, Manager
router.use(verifyToken);
router.post('/', verifyToken, verifyManager, productTypeController.createProductType);
router.put('/:code', verifyToken, verifyManager, productTypeController.updateProductType);
router.delete('/:code', verifyToken, verifyManager, productTypeController.deleteProductType);

// All users 
router.get('/', productTypeController.getAllProductTypes);
router.get('/:code', verifyToken, productTypeController.getProductTypeByCode);
router.get('/category/:categoryCode', verifyToken, productTypeController.getProductTypesByCategory);

module.exports = router;