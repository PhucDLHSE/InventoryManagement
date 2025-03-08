const Product = require('../models/productModel');
const { PRODUCT_MESSAGES } = require('../constants/messages');
const HTTP_STATUS = require('../utils/httpStatus');
const { sendResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const productController = {

  createProduct: asyncHandler(async (req, res) => {
    if (!req.user || !req.user.userCode) {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        false,
        "Lỗi xác thực."
      );
    }

    const result = await Product.create(req.body, req.user);
    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      "Tạo sản phẩm thành công",
      result
    );
  }),

  getAllProducts: asyncHandler(async (req, res) => {
    const products = await Product.getAll();
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy danh sách sản phẩm thành công",
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
        "Sản phẩm không tồn tại"
      );
    }
    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Lấy sản phẩm thành công",
      product
    );
  }),

  updateProduct: asyncHandler(async (req, res) => {
    const code = req.params.code;
    const updateFields = req.body;

    if (Object.keys(updateFields).length === 0) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Không có dữ liệu"
      );
    }

    const existingProduct = await Product.getByCode(code);
    if (!existingProduct) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        "Không tìm thấy sản phẩm!"
      );
    }

    let { quantity, status } = existingProduct;
    if (updateFields.quantity !== undefined) {
      quantity = updateFields.quantity;
      status = quantity > 0 ? 'instock' : 'outofstock';
    }
    const updatedProduct = await Product.updateProduct(code, {
      ...updateFields,
      quantity,
      status
    });

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Cập nhật sản phẩm thành công",
      updatedProduct
    );
  }),

  deleteProduct: asyncHandler(async (req, res) => {
    const result = await Product.delete(req.params.code);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        "Xóa sản phẩm thành công",
        result
    );
  }),

  getProductByProductType: asyncHandler(async (req, res) => {
    const { productType } = req.params;
  
    if (!productType) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Chưa nhập productType_code!"
      );
    }
  
    try {
      const products = await Product.getByProductType(productType);
    
      if (!products || products.length === 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          false,
          "Không tìm thấy sản phẩm!"
        );
      }
      
      const productTypeName = products[0]?.productType_name || productType;
    
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        "Lấy danh sách sản phẩm thành công!",
        {
          productType: productTypeName,
          count: products.length,
          data: products
        }
      );
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false,
        "Lỗi khi lấy sản phẩm: " + error.message
      );
    }
  }),

  getProductByCategory: asyncHandler(async (req, res) => {
    const { category } = req.params;
    
    if (!category) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Chưa nhập category_code!"
      );
    }
    
    try {
      const products = await Product.getByCategory(category);
      
      if (!products || products.length === 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          false,
          "Không tìm thấy sản phẩm nào trong category này!"
        );
      }
      
      const categoryName = products[0]?.category_name || category;
      
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        "Lấy danh sách sản phẩm thành công",
        {
          category: categoryName,
          count: products.length,
          data: products
        }
      );
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false,
        "Lỗi khi lấy sản phẩm: " + error.message
      );
    }
  }),

  searchProducts: asyncHandler(async (req, res) => {
    const { keyword } = req.query;
  
    if (!keyword || keyword.trim() === '') {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        false,
        "Vui lòng nhập từ khóa tìm kiếm"
      );
    }
  
    try {
      const products = await Product.searchProducts(keyword);
    
      if (!products || products.length === 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          false,
          `Không tìm thấy sản phẩm nào với từ khóa "${keyword}"`
        );
      }
    
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        true,
        "Tìm kiếm sản phẩm thành công",
        {
          keyword: keyword,
          count: products.length,
          data: products
        }
      );
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false,
        "Lỗi khi tìm kiếm sản phẩm: " + error.message
      );
    }
  }),

  // Lấy thông tin sản phẩm và các kho chứa nó
  getProductLocations: asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  if (!code) {
    return sendResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      false,
      "Thiếu mã sản phẩm"
    );
  }
  
  const productInfo = await Product.getProductWithWarehouses(code);
  
  if (!productInfo) {
    return sendResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      false,
      "Sản phẩm không tồn tại"
    );
  }
  
  return sendResponse(
    res,
    HTTP_STATUS.OK,
    true,
    "Lấy thông tin sản phẩm và kho chứa thành công",
    productInfo
  );
  })
  
};

module.exports = productController;