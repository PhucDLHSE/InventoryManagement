const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validateUser');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Các route dưới đây yêu cầu xác thực token
router.use(verifyToken);

// Các route yêu cầu quyền Admin
router.use(verifyAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users Controller
 *     summary: Lấy danh sách người dùng
 *     description: Trả về danh sách tất cả người dùng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     type: object
 *                     properties:
 *                       role_id:
 *                         type: string
 *                         example: "AD"
 *                       role_name:
 *                         type: string
 *                         example: "Admin"
 *                       user_code:
 *                         type: string
 *                         example: "AD0001" 
 *                       user_name:
 *                         type: string
 *                         example: "admin1"
 *                       fullName:
 *                         type: string
 *                         example: "Admin User"
 *                       email:
 *                         type: string
 *                         example: "admin1@gmail.com"
 *                       status:
 *                         type: string
 *                         example: "inactive"
 *                       created_at:
 *                         type: string
 *                         example: "2025-02-10T03:09:27.000Z"
 *                       updated_at:
 *                         type: string
 *                         example: "2025-02-10T03:09:27.000Z"
 *                       warehouse_code:
 *                         type: string
 *                         nullable: true
 *                       warehouse_name:
 *                         type: string
 *                         nullable: true
 *                       address:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không đủ quyền hạn
 */
router.get('/', userController.getAllUsers);

/**
* @swagger
* /api/users/{code}:
*   get:
*     tags:
*       - Users Controller
*     summary: Lấy thông tin người dùng theo mã người dùng
*     description: Trả về thông tin chi tiết của một người dùng dựa trên mã người dùng
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: code
*         required: true
*         schema:
*           type: string
*         description: Mã người dùng
*     responses:
*       200:
*         description: Thành công
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
*                     role_id:
*                       type: string
*                       example: "MA"
*                     role_name:
*                       type: string
*                       example: "Warehouse Manager"
*                     user_code:
*                       type: string
*                       example: "MA0001"
*                     user_name:
*                       type: string
*                       example: "phuchoang"
*                     fullName:
*                       type: string
*                       example: "Hoang Phuc"
*                     email:
*                       type: string
*                       example: "abc@gmail.com"
*                     status:
*                       type: string
*                       example: "inactive"
*                     created_at:
*                       type: string
*                       example: "2025-02-10T03:43:46.000Z"
*                     updated_at:
*                       type: string
*                       example: "2025-02-10T03:43:46.000Z"
*                     warehouse_code:
*                       type: string
*                       nullable: true
*                     warehouse_name:
*                       type: string
*                       nullable: true
*                     address:
*                       type: string
*                       nullable: true
*       401:
*         description: Không có quyền truy cập
*       403:
*         description: Không đủ quyền hạn
*       404:
*         description: Không tìm thấy người dùng
*/
router.get('/:code', userController.getUserByCode);

/**
* @swagger
* /api/users:
*   post:
*     tags:
*       - Users Controller
*     summary: Tạo mới người dùng
*     description: Tạo một người dùng mới trong hệ thống
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - role_type
*               - user_name  
*               - fullName
*               - email
*               - password
*             properties:
*               role_type:
*                 type: string
*                 example: "MANAGER"
*               user_name:
*                 type: string
*                 example: "phuchoang"
*               fullName:
*                 type: string
*                 example: "Hoang Phuc"
*               email:
*                 type: string
*                 example: "abc@gmail.com"
*               password:
*                 type: string
*                 example: "123456"
*               warehouse_code:
*                 type: string
*                 example: ""
*     responses:
*       201:
*         description: Tạo người dùng thành công
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
*                     role_id:
*                       type: string
*                       example: "MA"
*                     role_name:
*                       type: string
*                       example: "Warehouse Manager"
*                     user_code:
*                       type: string
*                       example: "MA0001"
*                     user_name:
*                       type: string
*                       example: "phuchoang"
*                     fullName:
*                       type: string
*                       example: "Hoang Phuc"
*                     email:
*                       type: string
*                       example: "abc@gmail.com"
*                     status:
*                       type: string
*                       example: "inactive"
*                     created_at:
*                       type: string
*                       example: "2025-02-10T03:43:46.000Z"
*                     updated_at:
*                       type: string
*                       example: "2025-02-10T03:43:46.000Z"
*                     warehouse_code:
*                       type: string
*                       nullable: true
*                     warehouse_name:
*                       type: string
*                       nullable: true
*                     address:
*                       type: string
*                       nullable: true
*       400:
*         description: Dữ liệu đầu vào không hợp lệ
*       401:
*         description: Không có quyền truy cập
*       403:
*         description: Không đủ quyền hạn
*       409:
*         description: Email hoặc username đã tồn tại
*/
router.post('/', validateCreateUser, userController.createUser);

/**
* @swagger
* /api/users/{code}:
*   put:
*     tags:
*       - Users Controller  
*     summary: Cập nhật thông tin người dùng
*     description: Cập nhật thông tin của người dùng dựa trên mã
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: code
*         required: true
*         schema:
*           type: string
*         description: Mã người dùng
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               fullName:
*                 type: string
*                 example: "Hoang Phuc Update"
*               email:
*                 type: string
*                 example: "update@gmail.com"
*               warehouse_code:
*                 type: string
*                 example: ""
*     responses:
*       200:
*         description: Cập nhật thành công
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
*                     role_id:
*                       type: string
*                       example: "AD"
*                     role_name:
*                       type: string
*                       example: "Admin"
*                     user_code:
*                       type: string
*                       example: "AD0001"
*                     user_name:
*                       type: string
*                       example: "admin"
*                     fullName:
*                       type: string
*                       example: "Hoang Phuc Update"
*                     email:
*                       type: string
*                       example: "update@gmail.com"
*                     status:
*                       type: string
*                       example: "inactive"
*                     created_at:
*                       type: string
*                       example: "2025-01-20T04:00:30.000Z"
*                     updated_at:
*                       type: string
*                       example: "2025-01-20T04:07:16.000Z"
*                     warehouse_code:
*                       type: string
*                       nullable: true
*                     warehouse_name:
*                       type: string
*                       nullable: true
*                     address:
*                       type: string
*                       nullable: true
*       400:
*         description: Dữ liệu đầu vào không hợp lệ
*       401:
*         description: Không có quyền truy cập
*       403:
*         description: Không đủ quyền hạn
*       404:
*         description: Không tìm thấy người dùng
*/
router.put('/:code', validateUpdateUser, userController.updateUser);

/**
* @swagger
* /api/users/{code}:
*   delete:
*     tags:
*       - Users Controller
*     summary: Xóa người dùng
*     description: Xóa người dùng dựa trên mã
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: code
*         required: true
*         schema:
*           type: string
*         description: Mã người dùng
*     responses:
*       200:
*         description: Xóa thành công
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
*                   example: "Xóa người dùng thành công!"
*                 data:
*                   type: object
*                   properties:
*                     user_code:
*                       type: string
*                       example: "ST0003"
*                     role_id:
*                       type: string
*                       example: "ST"
*                     user_name:
*                       type: string
*                       example: "staff1"
*                     fullName:
*                       type: string
*                       example: "Staff User"
*                     email:
*                       type: string
*                       example: "staff1@gmail.com"
*                     warehouse_code:
*                       type: string
*                       example: "WH0002"
*                     role_name:
*                       type: string
*                       example: "Staff"
*       401:
*         description: Không có quyền truy cập
*       403:
*         description: Không đủ quyền hạn
*       404:
*         description: Không tìm thấy người dùng
*/
router.delete('/:code', userController.deleteUser);

/**
* @swagger
* /api/users/{code}/warehouse:
*   put:
*     tags:
*       - Users Controller
*     summary: Thêm nhà kho cho người dùng
*     description: Cập nhật warehouse_code cho người dùng để phân bổ họ vào nhà kho
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: code
*         required: true
*         schema:
*           type: string
*           example: "MA0001"
*         description: Mã của người dùng cần cập nhật
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - warehouse_code
*             properties:
*               warehouse_code:
*                 type: string
*                 description: Mã kho cần cập nhật cho user
*                 example: ""
*     responses:
*       200:
*         description: Cập nhật thành công
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
*                     role_id:
*                       type: string
*                       example: "MA"
*                     role_name:
*                       type: string
*                       example: "Warehouse Manager"
*                     user_code: 
*                       type: string
*                       example: "MA0001"
*                     user_name:
*                       type: string
*                       example: "phuchoang"
*                     fullName:
*                       type: string
*                       example: "Hoang Phuc"
*                     email:
*                       type: string
*                       example: "abc@gmail.com"
*                     status:
*                       type: string
*                       example: "inactive"
*                     warehouse_code:
*                       type: string
*                       example: null
*                     warehouse_name:
*                       type: string
*                       example: null
*                     address:
*                       type: string
*                       example: null
*                     created_at:
*                       type: string
*                       example: "2025-01-20T04:01:23.000Z"
*                     updated_at:
*                       type: string
*                       example: "2025-01-20T04:04:13.000Z"
*       400:
*         description: Dữ liệu đầu vào không hợp lệ
*       401:
*         description: Không có quyền truy cập
*       403:
*         description: Không đủ quyền hạn
*       404:
*         description: Không tìm thấy người dùng
*/
router.put('/:code/warehouse', validateUpdateUser, userController.updateUser);

module.exports = router