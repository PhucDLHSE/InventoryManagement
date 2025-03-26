const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

class Product {
  static async generateProductCode() {
    try {
      const [lastCode] = await pool.query(
        'SELECT product_code FROM Product ORDER BY product_code DESC LIMIT 1'
      );
      let newCode = 'PR0001';
      if (lastCode[0]) {
        const lastNumber = parseInt(lastCode[0].product_code.substring(2));
        newCode = `PR${(lastNumber + 1).toString().padStart(4, '0')}`;
      }
      return newCode;
    } catch (error) {
      console.error('Lỗi khi tạo product_code:', error);
      throw error;
    }
  }

  static async create(productData, created_by) {
    try {
        const { product_name, size, color, quantity, productType_code } = productData;

        const created_by_user_code = created_by.userCode;
        if (!created_by_user_code) {
            throw new Error("Lỗi tạo sản phẩm.");
        }

        if (!product_name || !size || !color || quantity === undefined || !productType_code) {
            throw new Error("Thiếu thông tin bắt buộc.");
        }

        const [productType] = await pool.query(
            `SELECT * FROM ProductType WHERE productType_code = ?`, [productType_code]
        );
        if (productType.length === 0) {
            throw new Error("productType_code không tồn tại.");
        }

        const product_id = uuidv4();
        const product_code = await this.generateProductCode();

        await pool.query(`
            INSERT INTO Product (product_id, product_code, product_name, size, color, quantity, productType_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, product_code, product_name, size, color, quantity, productType_code]
        );

        return {
            success: true,
            message: "Tạo sản phẩm thành công.",
            data: { product_code, product_name, size, color, quantity, productType_code, created_by: created_by_user_code }
        };
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        throw error;
    }
  }
  
  static async updateProduct(product_code, updateFields) {
  try {
    console.log("🔄 Đang cập nhật sản phẩm với product_code:", product_code);
    console.log("📝 Dữ liệu cập nhật:", updateFields);

    const validFields = {};
    const allowedFields = [
      'product_name', 'price', 'quantity', 'status', 'productType_code', 'size', 'color'
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        validFields[field] = updateFields[field];
      }
    }

    if (Object.keys(validFields).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    const setClause = Object.keys(validFields)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(validFields), product_code];

    const [result] = await pool.query(
      `UPDATE Product SET ${setClause} WHERE product_code = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy sản phẩm để cập nhật");
    }

    const updatedProduct = await this.getByCode(product_code);
      return updatedProduct;
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      throw error;
    }
  }

  static async delete(product_code) {
    try {
      await pool.query(`DELETE FROM Product WHERE product_code = ?`, [product_code]);
      return { success: true, message: "Xóa sản phẩm thành công." };
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      throw error;
    }
  }

  static async getAll() {
    try {
      // Cập nhật trạng thái của sản phẩm có số lượng bằng 0
      await pool.query(`
        UPDATE Product 
        SET status = 'outofstock' 
        WHERE quantity = 0 AND status != 'outofstock'
      `);

      const [products] = await pool.query(`
        SELECT p.*, pt.productType_name
        FROM Product p
        JOIN ProductType pt ON p.productType_code = pt.productType_code
        ORDER BY p.product_name
      `);

      return products;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      throw error;
    }
}


  static async getByCode(product_code) {
    try {
        console.log("🔍 Đang tìm sản phẩm với product_code:", product_code);
        
        const [rows] = await pool.query(`
            SELECT p.*, pt.productType_name 
            FROM Product p
            JOIN ProductType pt ON p.productType_code = pt.productType_code
            WHERE BINARY p.product_code = ?`, [product_code]
        );

        console.log("📊 Kết quả tìm:", rows);
        return rows[0] || null;
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        throw error;
    }
  }

  static async getByProductType(productType_code) {
  try {
    console.log("🔍 Đang tìm sản phẩm theo productType_code:", productType_code);
    
    const [rows] = await pool.query(`
      SELECT p.*, pt.productType_name
      FROM Product p
      JOIN ProductType pt ON p.productType_code = pt.productType_code
      WHERE p.productType_code = ?
      ORDER BY p.product_name ASC`, 
      [productType_code]
    );
    
    console.log("📊 Số lượng sản phẩm tìm thấy:", rows.length);
    return rows;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo loại sản phẩm:", error);
    throw error;
  }
  }

  static async getByCategory(category_code) {
  try {
    console.log("🔍 Đang tìm sản phẩm theo category_code:", category_code);
    
    const [rows] = await pool.query(`
      SELECT p.*, pt.productType_name, c.category_name
      FROM Product p
      JOIN ProductType pt ON p.productType_code = pt.productType_code
      JOIN Category c ON pt.category_code = c.category_code
      WHERE c.category_code = ?
      ORDER BY p.product_name ASC`, 
      [category_code]
    );
    
    console.log("📊 Số lượng sản phẩm tìm thấy:", rows.length);
    return rows;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    throw error;
  }
  }

  static async searchProducts(keyword) {
  try {
    console.log("🔍 Đang tìm kiếm sản phẩm với từ khóa:", keyword);
    
    const searchKeyword = `%${keyword}%`;
    
    const [rows] = await pool.query(`
      SELECT p.*, pt.productType_name 
      FROM Product p
      JOIN ProductType pt ON p.productType_code = pt.productType_code
      WHERE p.product_name LIKE ? 
      OR p.product_code LIKE ? 
      OR p.color LIKE ?
      OR p.size LIKE ?
      OR pt.productType_name LIKE ?
      ORDER BY p.product_name ASC`, 
      [searchKeyword, searchKeyword, searchKeyword, searchKeyword, searchKeyword]
    );
    
    console.log("📊 Số lượng sản phẩm tìm thấy:", rows.length);
    return rows;
  } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  }

  static async getProductWithWarehouses(product_code) {
    try {
        const query = `
            SELECT 
                p.product_code,      
                p.product_name,      
                p.size,      
                p.color,      
                COALESCE(en.destination_warehouse_code, en.source_warehouse_code) AS warehouse_code,     
                w.warehouse_name,     
                COALESCE(SUM(ni.quantity), 0) AS total_quantity
            FROM product p 
            JOIN noteitem ni ON p.product_code = ni.product_code 
            JOIN exchangenote en ON ni.exchangeNote_id = en.exchangeNote_id 
            LEFT JOIN warehouse w  
                ON w.warehouse_code = COALESCE(en.destination_warehouse_code, en.source_warehouse_code) 
            WHERE ni.status = 'COMPLETED'  
            AND p.product_code = ? 
            GROUP BY p.product_code, p.product_name, p.size, p.color, warehouse_code, w.warehouse_name 
            ORDER BY w.warehouse_name, p.product_name 
            LIMIT 1000;
        `;

        const [rows] = await pool.query(query, [product_code]);
        return rows;
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm và kho hàng:", error);
        throw error;
    }
}


}

module.exports = Product;
