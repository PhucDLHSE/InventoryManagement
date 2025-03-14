const Category = require('../models/categoryModel');
const { CATEGORY_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const categoryController = {
  getCategories: asyncHandler(async (req, res) => {
    const { category_code } = req.body; 

    if (category_code) {
      const category = await Category.getByCode(category_code);
      if (!category) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          false,
          CATEGORY_MESSAGES.NOT_FOUND
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        CATEGORY_MESSAGES.GET_SUCCESS,
        category
      );
    } else {
      const categories = await Category.getAll();
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        CATEGORY_MESSAGES.GET_ALL_SUCCESS,
        categories
      );
    }
  }),

  createCategory: asyncHandler(async (req, res) => {
    const newCategory = await Category.create(req.body);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      CATEGORY_MESSAGES.CREATE_SUCCESS,
      newCategory
    );
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const updatedCategory = await Category.update(req.params.code, req.body);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      CATEGORY_MESSAGES.UPDATE_SUCCESS,
      updatedCategory
    );
  }),

  deleteCategory: asyncHandler(async (req, res) => {
    const deletedCategory = await Category.delete(req.params.code);
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      CATEGORY_MESSAGES.DELETE_SUCCESS,
      deletedCategory
    );
  })
};

module.exports = categoryController;