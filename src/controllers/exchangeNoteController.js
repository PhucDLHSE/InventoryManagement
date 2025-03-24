const ExchangeNote = require('../models/exchangeNoteModel');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const exchangeNoteController = {

  // Lấy thông tin phiếu nhập kho
  getExchangeNoteById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const importNote = await ExchangeNote.getExchangeNoteById(id);

    if (!importNote) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        "Không tìm thấy phiếu nhập kho"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy thông tin phiếu nhập kho thành công",
      importNote
    );
  }),

  // Lấy danh sách phiếu nhập kho
  getAllExchangeNotes: asyncHandler(async (req, res) => {
    const importNotes = await ExchangeNote.getAllExchangeNotes();

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy danh sách phiếu nhập kho thành công",
      importNotes
    );
  }),

  // Duyệt phiếu nhập kho
  approveExchangeNote: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approved_by = req.user?.userCode;

    console.log("ExchangeNote:", id);
    console.log("Người duyệt:", approved_by);

    if (!id) {
        return sendResponse(res, 400, false, "Thiếu exchangeNote_id");
    }

    if (!approved_by) {
        return sendResponse(res, 401, false, "Không có quyền duyệt phiếu.");
    }

    try {
        const result = await ExchangeNote.approveExchangeNote(id, approved_by);
        return sendResponse(res, 200, true, result.message);
    } catch (error) {
        return sendResponse(res, 500, false, `Lỗi server: ${error.message}`);
      }
  }),


  updateExchangeNoteStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    const approved_by = req.user?.userCode;

    console.log("📩 Nhận request cập nhật ExchangeNote:", id);
    console.log("🔍 Trạng thái mới:", status);
    console.log("🔍 Người duyệt:", approved_by);

    if (!id || !status) {
        return sendResponse(res, 400, false, "Thiếu exchangeNote_id hoặc trạng thái mới.");
    }

    if (!approved_by) {
        return sendResponse(res, 401, false, "Không có quyền thực hiện thao tác này.");
    }

    if (!["rejected", "finished"].includes(status)) {
        return sendResponse(res, 400, false, "Trạng thái không hợp lệ.");
    }

    try {
        const result = await ExchangeNote.updateExchangeNoteStatus(id, status, approved_by);
        return sendResponse(res, 200, true, result.message);
    } catch (error) {
        return sendResponse(res, 500, false, "Lỗi server: " + error.message);
    }
  })

};

module.exports = exchangeNoteController;