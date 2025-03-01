// src/controllers/productController.js
const Product = require('../models/productModel');
const { PRODUCT_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const productController = {
  getAllProducts: asyncHandler(async (req, res) => {
    const products = await Product.getAll();
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.GET_ALL_SUCCESS,
      products
    );
  }),

  getProductByCode: asyncHandler(async (req, res) => {
    const product = await Product.getByCode(req.params.code);
    if (!product) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        PRODUCT_MESSAGES.NOT_FOUND
      );
    }
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.GET_SUCCESS,
      product
    );
  }),

  createProduct: asyncHandler(async (req, res) => {
    const newProduct = await Product.create(req.body);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      PRODUCT_MESSAGES.CREATE_SUCCESS,
      newProduct
    );
  }),

  updateProduct: asyncHandler(async (req, res) => {
    const updatedProduct = await Product.update(req.params.code, req.body);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.UPDATE_SUCCESS,
      updatedProduct
    );
  }),

  deleteProduct: asyncHandler(async (req, res) => {
    const deletedProduct = await Product.delete(req.params.code);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.DELETE_SUCCESS,
      deletedProduct
    );
  }),

  getProductsByProductType: asyncHandler(async (req, res) => {
    const products = await Product.getByProductType(req.params.productTypeCode);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.GET_BY_PRODUCT_TYPE_SUCCESS,
      products
    );
  }),

  updateProductStock: asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    
    if (!quantity || isNaN(parseInt(quantity))) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        PRODUCT_MESSAGES.INVALID_QUANTITY
      );
    }

    const updatedProduct = await Product.updateStock(req.params.code, parseInt(quantity));
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_MESSAGES.UPDATE_STOCK_SUCCESS,
      updatedProduct
    );
  })
};

module.exports = productController;