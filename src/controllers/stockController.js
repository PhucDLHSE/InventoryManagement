const Stock = require('../models/stockModel');
const { sendResponse } = require('../utils/responseHandler');
const Product = require('../models/productModel');  


const stockController = {
    getStockByWarehouse: async (req, res) => {
        try {
            const { warehouse_code } = req.params;
            const stock = await Stock.getStockByWarehouse(warehouse_code);
    
            return sendResponse(res, 200, true, "Lấy thông tin tồn kho thành công", stock);
        } catch (error) {
            return sendResponse(res, 500, false, "Lỗi máy chủ", error.message);
        }
    },
    
    changeStockWarehouse: async (req, res) => {
        try {
            const { from_warehouse_code, to_warehouse_code, product_code, quantity } = req.body;
    
            if (!from_warehouse_code || !to_warehouse_code || !product_code || !quantity || isNaN(quantity)) {
                return sendResponse(res, 400, false, "Dữ liệu không hợp lệ");
            }
    
            const result = await Stock.changeStockWarehouse(from_warehouse_code, to_warehouse_code, product_code, parseInt(quantity));
    
            return sendResponse(res, 200, true, "Chuyển sản phẩm giữa các kho thành công", result);
        } catch (error) {
            return sendResponse(res, 400, false, error.message);
        }
    },
    
    addStock: async (req, res) => {
        try {
            const { product_code, quantity } = req.body;
    
            if (!product_code || !quantity || isNaN(quantity)) {
                return sendResponse(res, 400, false, "Dữ liệu không hợp lệ");
            }
    
            const result = await Stock.addStock(product_code, parseInt(quantity));
    
            return sendResponse(res, 200, true, "Thêm sản phẩm vào kho WH0001 thành công", result);
        } catch (error) {
            return sendResponse(res, 400, false, error.message);
        }
    },
    
    updateStock: async (req, res) => {
        try {
            const { warehouse_code, product_code, quantity } = req.body;
    
            if (quantity === undefined || isNaN(quantity)) {
                return sendResponse(res, 400, false, "Số lượng không hợp lệ");
            }
    
            const result = await Stock.updateStock(warehouse_code, product_code, parseInt(quantity));
    
            return sendResponse(res, 200, true, "Cập nhật số lượng sản phẩm trong kho thành công", result);
        } catch (error) {
            return sendResponse(res, 400, false, error.message);
        }
    }
};

module.exports = stockController;
