const ProductType = require('../models/productTypeModel');
const { PRODUCT_TYPE_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const productTypeController = {
  getProductTypes: asyncHandler(async (req, res) => {
    const { code, categoryCode } = req.body; 

    if (code) {
      const productType = await ProductType.getByCode(code);
      if (!productType) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          false,
          PRODUCT_TYPE_MESSAGES.NOT_FOUND
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        PRODUCT_TYPE_MESSAGES.GET_SUCCESS,
        productType
      );
    }

    if (categoryCode) {
      const productTypes = await ProductType.getByCategory(categoryCode);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        PRODUCT_TYPE_MESSAGES.GET_BY_CATEGORY_SUCCESS,
        productTypes
      );
    }

    const productTypes = await ProductType.getAll();
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_TYPE_MESSAGES.GET_ALL_SUCCESS,
      productTypes
    );
  }),

  createProductType: asyncHandler(async (req, res) => {
    const newProductType = await ProductType.create(req.body);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      PRODUCT_TYPE_MESSAGES.CREATE_SUCCESS,
      newProductType
    );
  }),

  updateProductType: asyncHandler(async (req, res) => {
    const updatedProductType = await ProductType.update(req.params.code, req.body);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_TYPE_MESSAGES.UPDATE_SUCCESS,
      updatedProductType
    );
  }),

  deleteProductType: asyncHandler(async (req, res) => {
    const deletedProductType = await ProductType.delete(req.params.code);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      PRODUCT_TYPE_MESSAGES.DELETE_SUCCESS,
      deletedProductType
    );
  })
};

module.exports = productTypeController;