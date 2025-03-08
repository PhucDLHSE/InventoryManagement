const ExchangeNote = require('../models/exchangeNoteModel');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const exchangeNoteController = {
    // Tạo phiếu nhập kho
createImportNote: asyncHandler(async (req, res) => {
    if (!req.user || !req.user.userCode) {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        "Không được phép thực hiện thao tác này"
      );
    }
  
    const importData = req.body;
  
    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!importData.warehouse_code || !importData.items || importData.items.length === 0) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Thiếu thông tin bắt buộc cho phiếu nhập kho"
      );
    }
  
    // Kiểm tra source_type hợp lệ
    if (importData.source_type && !['EXTERNAL', 'INTERNAL', 'SYSTEM'].includes(importData.source_type)) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Loại nguồn không hợp lệ. Chỉ chấp nhận EXTERNAL, INTERNAL hoặc SYSTEM"
      );
    }
  
    // Kiểm tra kho nguồn nếu là INTERNAL
    if (importData.source_type === 'INTERNAL' && !importData.source_warehouse_id) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Cần chỉ định kho nguồn cho loại nhập INTERNAL"
      );
    }
  
    try {
      const result = await ExchangeNote.createImportNote(importData, req.user);
      
      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        true,
        "Tạo phiếu nhập kho thành công",
        result
      );
    } catch (error) {
      console.error("Lỗi khi tạo phiếu nhập kho:", error);
      return sendResponse(
        res,
        HTTP_STATUS.SERVER_ERROR,
        false,
        error.message || "Lỗi khi tạo phiếu nhập kho"
      );
    }
  }),

  // Lấy thông tin phiếu nhập kho
  getImportNoteById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const importNote = await ExchangeNote.getImportNoteById(id);

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
  getAllImportNotes: asyncHandler(async (req, res) => {
    const importNotes = await ExchangeNote.getAllImportNotes();

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy danh sách phiếu nhập kho thành công",
      importNotes
    );
  }),

  // Duyệt phiếu nhập kho
  approveImportNote: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.user || !req.user.userCode) {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        "Không được phép thực hiện thao tác này"
      );
    }

    await ExchangeNote.approveImportNote(id, req.user.userCode);

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Duyệt phiếu nhập kho thành công"
    );
  }),

  // Hoàn thành phiếu nhập kho
  completeImportNote: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.user || !req.user.userCode) {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        "Không được phép thực hiện thao tác này"
      );
    }

    await ExchangeNote.completeImportNote(id);

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Hoàn thành phiếu nhập kho thành công"
    );
  }),

  // Từ chối phiếu nhập kho
  rejectImportNote: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.user || !req.user.userCode) {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        "Không được phép thực hiện thao tác này"
      );
    }

    await ExchangeNote.rejectImportNote(id, req.user.userCode);

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Từ chối phiếu nhập kho thành công"
    );
  })
};

module.exports = exchangeNoteController;