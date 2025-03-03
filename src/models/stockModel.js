const pool = require('../config/dbConfig');
const Product = require('../models/productModel');

class Stock {
    static async changeStockWarehouse(from_warehouse_code, to_warehouse_code, product_code, quantity) {
        try {
            if (from_warehouse_code === to_warehouse_code) {
                throw new Error("Kho nguồn và kho đích không thể trùng nhau");
            }
    
            // 🔥 Kiểm tra số lượng sản phẩm trong kho nguồn
            const [sourceStock] = await pool.query(`
                SELECT quantity FROM Stock WHERE warehouse_code = ? AND product_code = ?`, 
                [from_warehouse_code, product_code]
            );
    
            if (!sourceStock.length || sourceStock[0].quantity < quantity) {
                throw new Error(`Kho ${from_warehouse_code} không đủ số lượng sản phẩm ${product_code} để chuyển`);
            }
    
            // 🔥 Cập nhật số lượng trong kho nguồn
            const newSourceQuantity = sourceStock[0].quantity - quantity;
            if (newSourceQuantity === 0) {
                await pool.query(`DELETE FROM Stock WHERE warehouse_code = ? AND product_code = ?`,
                    [from_warehouse_code, product_code]);
            } else {
                await pool.query(`UPDATE Stock SET quantity = ? WHERE warehouse_code = ? AND product_code = ?`,
                    [newSourceQuantity, from_warehouse_code, product_code]);
            }
    
            // 🔥 Cập nhật kho đích
            const [targetStock] = await pool.query(`
                SELECT quantity FROM Stock WHERE warehouse_code = ? AND product_code = ?`, 
                [to_warehouse_code, product_code]
            );
    
            if (targetStock.length > 0) {
                await pool.query(`UPDATE Stock SET quantity = quantity + ? WHERE warehouse_code = ? AND product_code = ?`,
                    [quantity, to_warehouse_code, product_code]);
            } else {
                await pool.query(`INSERT INTO Stock (stock_id, stock_code, warehouse_code, product_code, quantity)
                    VALUES (UUID(), CONCAT('ST', LPAD(FLOOR(RAND() * 10000), 4, '0')), ?, ?, ?)`, 
                    [to_warehouse_code, product_code, quantity]);
            }
    
            // 🔥 Cập nhật trạng thái sản phẩm (nếu cần)
            await Product.updateProductStatus(product_code);
    
            return {
                from_warehouse_code,
                to_warehouse_code,
                product_code,
                quantity_transferred: quantity,
                remaining_in_source: newSourceQuantity
            };
        } catch (error) {
            console.error('Lỗi khi chuyển sản phẩm giữa kho:', error);
            throw error;
        }
    }
    
    static async getStockByWarehouse(warehouse_code) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    s.warehouse_code, 
                    s.product_code, 
                    s.quantity, 
                    p.product_name, 
                    p.size, 
                    p.color, 
                    p.status 
                FROM Stock s
                JOIN Product p ON s.product_code = p.product_code
                WHERE s.warehouse_code = ?`, 
                [warehouse_code]
            );
    

            const stockData = {};
    
            rows.forEach(row => {
                const { product_name, product_code, size, color, quantity, status } = row;
    
                if (!stockData[product_name]) {
                    stockData[product_name] = {
                        product_name,
                        variants: []
                    };
                }
    
                stockData[product_name].variants.push({
                    product_code,
                    size,
                    color,
                    quantity,
                    status
                });
            });
    
            return {
                warehouse_code,
                products: Object.values(stockData)
            };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin tồn kho:', error);
            throw error;
        }
    }
    
    static async checkProductAvailability(product_code, quantity) {
        const [rows] = await pool.query(`
            SELECT quantity FROM Product WHERE product_code = ?`, 
            [product_code]
        );

        if (!rows[0] || rows[0].quantity < quantity) {
            return false; 
        }

        return true;
    }

    static async addStock(product_code, quantity) {
        try {
            const warehouse_code = 'WH0001';
            const [product] = await pool.query(`
                SELECT * FROM Product WHERE product_code = ?`, 
                [product_code]
            );
    
            if (product.length === 0) {
                throw new Error(`Sản phẩm ${product_code} không tồn tại`);
            }
            const [existingStock] = await pool.query(`
                SELECT quantity FROM Stock WHERE warehouse_code = ? AND product_code = ?`,
                [warehouse_code, product_code]
            );
    
            let newQuantity;
            if (existingStock.length > 0) {
                newQuantity = existingStock[0].quantity + quantity;
                await pool.query(`
                    UPDATE Stock SET quantity = ? WHERE warehouse_code = ? AND product_code = ?`,
                    [newQuantity, warehouse_code, product_code]
                );
            } else {
                newQuantity = quantity;
                await pool.query(`
                    INSERT INTO Stock (stock_id, stock_code, warehouse_code, product_code, quantity)
                    VALUES (UUID(), CONCAT('ST', LPAD(FLOOR(RAND() * 10000), 4, '0')), ?, ?, ?)`, 
                    [warehouse_code, product_code, quantity]
                );
            }
            await Product.updateProductStatus(product_code);
    
            return {
                warehouse_code,
                product_code,
                added_quantity: quantity,
                total_quantity_in_warehouse: newQuantity
            };
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào kho:', error);
            throw error;
        }
    }
    
    static async updateStock(warehouse_code, product_code, quantity) {
        try {
            const [existingStock] = await pool.query(`
                SELECT quantity 
                FROM Stock 
                WHERE warehouse_code = ? AND product_code = ?`,
            [warehouse_code, product_code]
            );

        if (!existingStock.length) {
    throw new Error(`Sản phẩm ${product_code} không tồn tại trong kho ${warehouse_code}`);
            }

        const newQuantity = existingStock[0].quantity + quantity;

        if (newQuantity < 0) {
            throw new Error(`Số lượng sản phẩm ${product_code} trong kho ${warehouse_code} không đủ để giảm`);
        }

        await pool.query(`
            UPDATE Stock SET quantity = ? WHERE warehouse_code = ? AND product_code = ?`,
            [newQuantity, warehouse_code, product_code]
        );
        await Product.updateProductQuantity(product_code);

    return {
        warehouse_code,
        product_code,
        updated_quantity: newQuantity
    };

        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm trong kho:', error);
            throw error;
        }
    }
}

module.exports = Stock;
