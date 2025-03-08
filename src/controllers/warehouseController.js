// src/controllers/warehouseController.js
const Warehouse = require('../models/warehouseModel');
const { WAREHOUSE_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const warehouseController = {
  getAllWarehouses: asyncHandler(async (req, res) => {
    const warehouses = await Warehouse.getAll();
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      WAREHOUSE_MESSAGES.GET_ALL_SUCCESS,
      warehouses
    );
  }),

  getWarehouseByCode: asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.getByCode(req.params.code);
    if (!warehouse) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        WAREHOUSE_MESSAGES.NOT_FOUND
      );
    }
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      WAREHOUSE_MESSAGES.GET_SUCCESS,
      warehouse
    );
  }),

  createWarehouse: asyncHandler(async (req, res) => {
    const newWarehouse = await Warehouse.create(req.body);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      WAREHOUSE_MESSAGES.CREATE_SUCCESS,
      newWarehouse
    );
  }),

  updateWarehouse: asyncHandler(async (req, res) => {
    const updatedWarehouse = await Warehouse.update(req.params.code, req.body);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      WAREHOUSE_MESSAGES.UPDATE_SUCCESS,
      updatedWarehouse
    );
  }),

  deleteWarehouse: asyncHandler(async (req, res) => {
    const deletedWarehouse = await Warehouse.delete(req.params.code);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      WAREHOUSE_MESSAGES.DELETE_SUCCESS,
      deletedWarehouse
    );
  }),

  getWarehouseProducts: asyncHandler(async (req, res) => {
    const { code } = req.params;
    
    if (!code) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Thiếu mã kho hàng"
      );
    }
    
    // Kiểm tra kho có tồn tại không
    const warehouse = await Warehouse.getWarehouseById(code);
    
    if (!warehouse) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        "Kho hàng không tồn tại"
      );
    }
    
    // Lấy danh sách sản phẩm trong kho
    const products = await Warehouse.getProductsInWarehouse(code);
    
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy danh sách sản phẩm trong kho thành công",
      {
        warehouse: warehouse,
        products: products,
        total_products: products.length
      }
    );
  }),
  
};

module.exports = warehouseController;