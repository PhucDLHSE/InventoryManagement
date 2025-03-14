const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');
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
// Admin, Manager
router.use(verifyToken);

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
router.post('/', verifyToken, verifyManager, productTypeController.createProductType);

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
router.put('/:code', verifyToken, verifyManager, productTypeController.updateProductType);

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
router.delete('/:code', verifyToken, verifyManager, productTypeController.deleteProductType);

/**
 * @swagger
 * /api/product-types:
 *   get:
 *     summary: Lấy danh sách loại sản phẩm hoặc loại sản phẩm cụ thể
 *     tags: [Product Types]
 *     description: Nếu không có request body, API sẽ trả về tất cả loại sản phẩm. Nếu có `code` hoặc `categoryCode` trong body, API sẽ lọc theo mã sản phẩm hoặc danh mục.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã loại sản phẩm cần lấy
 *                 example: "PT0001"
 *               categoryCode:
 *                 type: string
 *                 description: Mã danh mục cần lọc
 *                 example: "CAT01"
 *     responses:
 *       200:
 *         description: Danh sách loại sản phẩm hoặc một loại sản phẩm cụ thể
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
 *                   example: "Lấy danh sách loại sản phẩm thành công"
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductType'
 *                     - $ref: '#/components/schemas/ProductType'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */
// All users 
router.get('/', productTypeController.getProductTypes);

module.exports = router;