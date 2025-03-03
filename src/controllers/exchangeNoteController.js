const ExchangeNote = require("../models/exchangeNoteModel"); 
const { sendResponse } = require("../utils/responseHandler");
const HTTP_STATUS = require("../utils/httpStatus");
const asyncHandler = require("../utils/asyncHandler");

const exchangeNoteController = {
    getAllExchangeNotes: asyncHandler(async (req, res) => {
        const exchangeNotes = await ExchangeNote.getAll();
        return sendResponse(
            res,
            HTTP_STATUS.OK,
            true,
            "Lấy danh sách phiếu nhập/xuất thành công",
            exchangeNotes
        );
    }),

    approveExchangeNote: asyncHandler(async (req, res) => {
        const { exchangeNoteId } = req.params;
        const { status } = req.body;
        
        console.log("🟢 User từ token:", req.user); // Debugging
        const approvedBy = req.user?.userCode; // Lấy user_code từ token
    
        if (!approvedBy) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Không thể xác định người duyệt phiếu");
        }
    
        if (!["approved", "rejected"].includes(status)) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Trạng thái không hợp lệ.");
        }
    
        const result = await ExchangeNote.approve(exchangeNoteId, status, approvedBy);
        return sendResponse(res, HTTP_STATUS.OK, true, result.message);
    }),
    

    createImportNote: asyncHandler(async (req, res) => {
        const { warehouse_code, products } = req.body;
        const created_by = req.user?.userCode; 
        console.log("Thông tin user từ token:", req.user);


        if (!created_by) {
            return res.status(403).json({ success: false, message: "Không thể xác định người tạo phiếu nhập" });
        }

        if (!warehouse_code || !products || products.length === 0) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Thông tin phiếu nhập không hợp lệ.");
        }

        const result = await ExchangeNote.createImportNote(warehouse_code, created_by, products);
        return sendResponse(res, HTTP_STATUS.CREATED, true, result.message, { exchangeNoteId: result.exchangeNoteId });
    }),
};

module.exports = exchangeNoteController;
