const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyToken, verifyAdmin, onlyAdmin, verifyManager} = require('../middleware/authMiddleware');
const { validateCreateWarehouse } = require('../middleware/validateWarehouse');

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       properties:
 *         warehouse_id:
 *           type: string
 *           example: "5e3388fb-83f5-49ba-946f-ffec0717b0d9"
 *         warehouse_code:
 *           type: string
 *           example: "WH0002"
 *         warehouse_name:
 *           type: string
 *           example: "Kho Hàng Hà Nội"
 *         address:
 *           type: string
 *           example: "Quận Ba Đình, Hà Nội"
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *   responses:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Lấy tất cả kho
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: Lấy tất cả kho thành công
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
 *                   example: "Lấy tất cả kho thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Warehouse'
 */

/**
 * @swagger
 * /api/warehouses/{code}:
 *   get:
 *     summary: Lấy thông tin kho theo mã
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã kho
 *         example: WH0002
 *     responses:
 *       200:
 *         description: Lấy thông tin kho thành công
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
 *                   example: "Lấy thông tin kho thành công"
 *                 data:
 *                   $ref: '#/components/schemas/WarehouseDetail'
 *       404:
 *         description: Không tìm thấy kho
 */

/**
 * @swagger
 * /api/warehouses/products/{code}:
 *   get:
 *     summary: Lấy danh sách sản phẩm trong kho
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã kho
 *         example: WH0001
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm trong kho thành công
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
 *                   example: "Lấy danh sách sản phẩm trong kho thành công"
 *                 data:
 *                   $ref: '#/components/schemas/WarehouseProducts'
 *       404:
 *         description: Không tìm thấy kho
 */
// All users
router.get('/', warehouseController.getAllWarehouses);
router.get('/products/:code', verifyToken, warehouseController.getWarehouseProducts);
router.get('/:code', verifyToken, warehouseController.getWarehouseByCode);

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Tạo kho mới
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     description: Yêu cầu quyền Admin để thực hiện
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_code
 *               - warehouse_name
 *               - address
 *             properties:
 *               warehouse_code:
 *                 type: string
 *                 example: "WH0005"
 *               warehouse_name:
 *                 type: string
 *                 example: "Kho Hàng Đà Nẵng"
 *               address:
 *                 type: string
 *                 example: "Quận Hải Châu, Đà Nẵng"
 *               manager:
 *                 type: string
 *                 example: "manager123"
 *               staffs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["staff123", "staff456"]
 *     responses:
 *       201:
 *         description: Tạo kho thành công
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
 *                   example: "Tạo kho thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       409:
 *         description: Mã kho đã tồn tại
 */

/**
 * @swagger
 * /api/warehouses/{code}:
 *   put:
 *     summary: Cập nhật thông tin kho theo mã
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     description: Yêu cầu quyền Admin để thực hiện
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã kho
 *         example: WH0002
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouse_name:
 *                 type: string
 *                 example: "Kho Hàng Hà Nội (Updated)"
 *               address:
 *                 type: string
 *                 example: "Quận Cầu Giấy, Hà Nội"
 *               manager:
 *                 type: string
 *                 example: "manager123"
 *               staffs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["staff123", "staff456"]
 *     responses:
 *       200:
 *         description: Cập nhật kho thành công
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
 *                   example: "Cập nhật kho thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Warehouse'
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy kho
 */

/**
 * @swagger
 * /api/warehouses/{code}:
 *   delete:
 *     summary: Xóa kho theo mã
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     description: Yêu cầu quyền Admin để thực hiện
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã kho
 *         example: WH0002
 *     responses:
 *       200:
 *         description: Xóa kho thành công
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
 *                   example: "Xóa kho thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy kho
 *       409:
 *         description: Không thể xóa kho đang chứa sản phẩm
 */
// Admin-only
router.post('/', verifyToken, onlyAdmin, validateCreateWarehouse, warehouseController.createWarehouse);
router.put('/:code', verifyToken, onlyAdmin, warehouseController.updateWarehouse);
router.delete('/:code', verifyToken, onlyAdmin, warehouseController.deleteWarehouse);

module.exports = router;
