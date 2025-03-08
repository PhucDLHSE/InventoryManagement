const express = require('express');
const router = express.Router();
const exchangeNoteController = require('../controllers/exchangeNoteController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

// Tạo phiếu nhập kho - Chỉ Manager có thể tạo
router.post('/import', verifyToken, verifyManager, exchangeNoteController.createImportNote);

// Lấy danh sách phiếu nhập kho
router.get('/import', verifyToken, exchangeNoteController.getAllImportNotes);

// Lấy thông tin một phiếu nhập kho
router.get('/import/:id', verifyToken, exchangeNoteController.getImportNoteById);

// Duyệt phiếu nhập kho - Chỉ Manager/Admin có thể duyệt
router.patch('/import/approve/:id', verifyToken, verifyManager, exchangeNoteController.approveImportNote);

// Hoàn thành phiếu nhập kho - Chỉ Manager/Admin có thể hoàn thành
router.patch('/import/complete/:id', verifyToken, verifyManager, exchangeNoteController.completeImportNote);

// Từ chối phiếu nhập kho - Chỉ Manager/Admin có thể từ chối
router.patch('/import/reject/:id', verifyToken, verifyManager, exchangeNoteController.rejectImportNote);

module.exports = router;