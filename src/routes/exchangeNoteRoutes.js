const express = require('express');
const router = express.Router();
const exchangeNoteController = require('../controllers/exchangeNoteController');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

// Lấy danh sách phiếu nhập kho
router.get('/all', verifyToken, exchangeNoteController.getAllExchangeNotes);

// Lấy thông tin một phiếu nhập kho
router.get('/:id', verifyToken, exchangeNoteController.getExchangeNoteById);

// Duyệt phiếu nhập kho - Chỉ Manager/Admin có thể duyệt
router.put('/approve/:id', verifyToken, verifyManager, exchangeNoteController.approveExchangeNote);

router.put('/status/:id', verifyToken, verifyManager, exchangeNoteController.updateExchangeNoteStatus);

module.exports = router;    