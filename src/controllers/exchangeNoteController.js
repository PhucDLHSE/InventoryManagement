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
    const isSystemImport = importData.is_system_import === true;
  
    if ( !importData.items || importData.items.length === 0) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Thiếu thông tin bắt buộc cho phiếu nhập kho"
      );
    }

    // Chỉ yêu cầu warehouse_code khi KHÔNG phải nhập vào hệ thống
    if (!isSystemImport && !importData.warehouse_code) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Thiếu mã kho nhập hàng"
      );
    }
  
    if (importData.source_type && !['EXTERNAL', 'INTERNAL', 'SYSTEM'].includes(importData.source_type)) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Loại nguồn không hợp lệ. Chỉ chấp nhận EXTERNAL(kho ngoài), INTERNAL(chuyển kho nội bộ) hoặc SYSTEM(từ hệ thống)"
      );
    }
  
    // INTERNAL: Chuyển kho nội bộ
    if (importData.source_type === 'INTERNAL' && !importData.source_warehouse_id) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Cần chỉ định kho nguồn (source_warehouse_code cho việc chuyển kho nội bộ !"
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
      "Duyệt phiếu nhập kho thành công !."
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
      "Phiếu đã hoàn thành"
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
  
  try {
    await ExchangeNote.rejectImportNote(id, req.user.userCode);

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Từ chối phiếu nhập kho thành công"
    );
  } catch (error) {
    console.error("Lỗi khi từ chối phiếu:", error);
    
    if (error.message.includes("Chỉ có thể từ chối phiếu đã được duyệt")) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        error.message
      );
    } else if (error.message.includes("Phiếu không tồn tại")) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        error.message
      );
    } else {
      return sendResponse(
        res,
        HTTP_STATUS.SERVER_ERROR,
        false,
        "Lỗi khi từ chối phiếu: " + error.message
      );
    }
  }
  })
};

module.exports = exchangeNoteController;