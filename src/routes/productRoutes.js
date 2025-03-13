/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - product_code
 *         - product_name
 *         - size
 *         - color
 *         - quantity
 *         - productType_code
 *         - created_by
 *       properties:
 *         product_code:
 *           type: string
 *           example: PR0005
 *         product_name:
 *           type: string
 *           example: Quần jeans nam dài rách rối
 *         size:
 *           type: string
 *           example: "30"
 *         color:
 *           type: string
 *           example: Xanh đen
 *         quantity:
 *           type: integer
 *           example: 100
 *         productType_code:
 *           type: string
 *           example: PT0007
 *         created_by:
 *           type: string
 *           example: DF0001
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: Quần jeans nam dài rách rối
 *               size:
 *                 type: string
 *                 example: "30"
 *               color:
 *                 type: string
 *                 example: Xanh đen
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               productType_code:
 *                 type: string
 *                 example: PT0007
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
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
 *                   example: "Tạo sản phẩm thành công."
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products/{code}:
 *   patch:
 *     summary: Cập nhật sản phẩm theo mã
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã sản phẩm cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: Quần jeans nam dài rách rối
 *               size:
 *                 type: string
 *                 example: "30"
 *               color:
 *                 type: string
 *                 example: Xanh đen
 *               quantity:
 *                 type: integer
 *                 example: 120
 *               productType_code:
 *                 type: string
 *                 example: PT0007
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
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
 *                   example: "Cập nhật sản phẩm thành công."
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Sản phẩm không tồn tại
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products/{code}:
 *   delete:
 *     summary: Xóa sản phẩm theo mã
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
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
 *                   example: "Xóa sản phẩm thành công."
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Sản phẩm không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/', verifyToken, verifyManager, productController.createProduct);
router.patch('/:code', verifyToken, verifyManager, productController.updateProduct);
router.delete('/:code', verifyToken, verifyManager, productController.deleteProduct);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Tìm kiếm sản phẩm theo từ khóa
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: false
 *         description: Từ khóa tìm kiếm theo tên hoặc mã sản phẩm
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Mã danh mục để lọc sản phẩm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Số trang kết quả
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Số lượng kết quả mỗi trang
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm sản phẩm
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
 *                   example: "Tìm kiếm sản phẩm thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo danh mục
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã danh mục cần lấy danh sách sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm theo danh mục thành công
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
 *                   example: "Lấy danh sách sản phẩm theo danh mục thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */

router.get('/search', productController.searchProducts);
router.get('/category/:category', verifyToken, productController.getProductByCategory);

/**
 * @swagger
 * /api/products/productType/{productType}:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo loại sản phẩm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productType
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã loại sản phẩm cần lấy danh sách sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
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
 *                   example: "Lấy danh sách sản phẩm theo loại sản phẩm thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products/{code}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo mã
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã sản phẩm cần lấy thông tin
 *     responses:
 *       200:
 *         description: Lấy thông tin sản phẩm thành công
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
 *                   example: "Lấy thông tin sản phẩm thành công."
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
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
 *                   example: "Lấy danh sách sản phẩm thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Lỗi server
 */

router.get('/productType/:productType', verifyToken, productController.getProductByProductType);
router.get('/:code', verifyToken, productController.getProductByCode);
router.get('/', productController.getAllProducts);


/**
 * @swagger
 * /api/products/{code}/locations:
 *   get:
 *     summary: Lấy danh sách vị trí tồn kho của sản phẩm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã sản phẩm cần lấy danh sách vị trí tồn kho
 *     responses:
 *       200:
 *         description: Lấy danh sách vị trí tồn kho thành công
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
 *                   example: "Lấy danh sách vị trí tồn kho thành công."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       warehouse_code:
 *                         type: string
 *                         example: "WH001"
 *                       warehouse_name:
 *                         type: string
 *                         example: "Kho Hà Nội"
 *                       quantity:
 *                         type: integer
 *                         example: 50
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm hoặc không có tồn kho
 *       500:
 *         description: Lỗi server
 */

router.get('/:code/locations', verifyToken, productController.getProductLocations);

module.exports = router;