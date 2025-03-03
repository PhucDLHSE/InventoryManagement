const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const { PRODUCT_MESSAGES } = require('../constants/messages');
const ProductType = require('./productTypeModel');

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
      console.error('Error generating product code:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
        const [products] = await pool.query(`
            SELECT p.*, pt.productType_name, pt.price, 
                   c.category_name, c.category_code
            FROM Product p
            JOIN ProductType pt ON p.productType_code = pt.productType_code
            JOIN Category c ON pt.category_code = c.category_code
            ORDER BY p.product_name
        `);

        const productsByType = {};

        products.forEach(product => {
            const { productType_code, productType_name } = product;
            
            if (!productsByType[productType_code]) {
                productsByType[productType_code] = {
                    productType_code,
                    productType_name,
                    category: {
                        category_code: product.category_code,
                        category_name: product.category_name
                    },
                    price: product.price,
                    products: []
                };
            }

            productsByType[productType_code].products.push({
                product_id: product.product_id,
                product_code: product.product_code,
                product_name: product.product_name,
                size: product.size,
                color: product.color,
                quantity: product.quantity,
                status: product.status
            });
        });

        return Object.values(productsByType);
    } catch (error) {
        console.error('Error in getAll:', error);
        throw error;
    }
  }

  static async getByCode(productCode) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, pt.productType_name, pt.price
        FROM Product p
        JOIN ProductType pt ON p.productType_code = pt.productType_code
        WHERE p.product_code = ?
      `, [productCode]);
      return rows[0];
    } catch (error) {
      console.error('Error in getByCode:', error);
      throw error;
    }
  }

  static async create(productData) {
    try {
        const { product_name, size, color, quantity, productType_code, created_by } = productData;

        // 1️⃣ Kiểm tra dữ liệu đầu vào
        if (!product_name || !size || !color || quantity === undefined || !productType_code || !created_by) {
            throw new Error(PRODUCT_MESSAGES.MISSING_FIELDS);
        }

        // 2️⃣ Kiểm tra loại sản phẩm có tồn tại không
        const [productType] = await pool.query(`
            SELECT * FROM ProductType WHERE productType_code = ?`, 
            [productType_code]
        );

        if (productType.length === 0) {
            throw new Error(PRODUCT_MESSAGES.PRODUCT_TYPE_NOT_FOUND);
        }

        // 3️⃣ Tạo sản phẩm trong bảng Product (Số lượng ban đầu = 0)
        const product_id = uuidv4();
        const product_code = await this.generateProductCode();

        await pool.query(`
            INSERT INTO Product (product_id, product_code, product_name, size, color, quantity, productType_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, product_code, product_name, size, color, 0, productType_code] 
        );

        // 4️⃣ Tạo phiếu nhập kho (ExchangeNote) ở trạng thái `pending`
        const exchangeNoteId = uuidv4();  

        await pool.query(`
          INSERT INTO ExchangeNote (exchangeNote_id, warehouse_code, type, status, created_by, date)
          VALUES (?, 'WH0001', 'import', 'pending', ?, NOW())`, 
          [exchangeNoteId, created_by]
      );

        // 5️⃣ Lưu sản phẩm vào `NoteItem`
        const noteItemId = uuidv4();
        await pool.query(`
            INSERT INTO NoteItem (noteItem_id, noteItem_code, product_code, exchangeNote_id, quantity)
            VALUES (?, ?, ?, ?, ?)`, 
            [noteItemId, `NI${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, product_code, exchangeNoteId, quantity]
        );

        return {
          success: true,
          message: "Tạo sản phẩm thành công và phiếu nhập kho đã được tạo (chờ duyệt)",
          data: {
              product: {
                  product_id,
                  product_code,
                  product_name,
                  size,
                  color,
                  quantity,
                  productType_code
              },
              exchangeNote: {
                  exchangeNote_id: exchangeNoteId,
                  warehouse_code: "WH0001",
                  status: "pending",
                  created_by
              }
          }
      };
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        throw error;
    }
}

  static async update(productCode, productData) {
    try {
      const { product_name, size, color, quantity, productType_code, status } = productData;
      const updateFields = [];
      const values = [];

      if (product_name !== undefined) {
        updateFields.push('product_name = ?');
        values.push(product_name);
      }

      if (size !== undefined) {
        updateFields.push('size = ?');
        values.push(size);
      }

      if (color !== undefined) {
        updateFields.push('color = ?');
        values.push(color);
      }

      if (quantity !== undefined) {
        updateFields.push('quantity = ?');
        values.push(quantity);
        
        if (status === undefined) {
          updateFields.push('status = ?');
          values.push(quantity > 0 ? 'instock' : 'outofstock');
        }
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        values.push(status);
      }

      if (productType_code !== undefined) {
        const productType = await ProductType.getByCode(productType_code);
        if (!productType) {
          throw new Error(PRODUCT_MESSAGES.PRODUCT_TYPE_NOT_FOUND);
        }
        updateFields.push('productType_code = ?');
        values.push(productType_code);
      }

      if (updateFields.length === 0) {
        throw new Error(PRODUCT_MESSAGES.NO_UPDATE_DATA);
      }

      values.push(productCode);

      const query = `
        UPDATE Product 
        SET ${updateFields.join(', ')}
        WHERE product_code = ?
      `;
      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        throw new Error(PRODUCT_MESSAGES.NOT_FOUND);
      }

      return this.getByCode(productCode);
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  static async delete(productCode) {
    try {
      const product = await this.getByCode(productCode);
      if (!product) {
        throw new Error(PRODUCT_MESSAGES.NOT_FOUND);
      }
      const [stockCount] = await pool.query(
        'SELECT COUNT(*) as count FROM Stock WHERE product_code = ?',
        [productCode]
      );
      if (stockCount[0].count > 0) {
        throw new Error(PRODUCT_MESSAGES.USED_IN_STOCK);
      }

      const [result] = await pool.query(
        'DELETE FROM Product WHERE product_code = ?',
        [productCode]
      );

      return product;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  static async getByProductType(productTypeCode) {
    try {
      const [productTypeInfo] = await pool.query(`
        SELECT pt.*, c.category_name, c.category_code
        FROM ProductType pt
        JOIN Category c ON pt.category_code = c.category_code
        WHERE pt.productType_code = ?
      `, [productTypeCode]);
  
      if (productTypeInfo.length === 0) {
        throw new Error(PRODUCT_MESSAGES.PRODUCT_TYPE_NOT_FOUND);
      }
  
      const [products] = await pool.query(`
        SELECT p.*
        FROM Product p
        WHERE p.productType_code = ?
        ORDER BY p.size, p.color
      `, [productTypeCode]);
  
      const result = {
        productType_code: productTypeInfo[0].productType_code,
        productType_name: productTypeInfo[0].productType_name,
        category: {
          category_code: productTypeInfo[0].category_code,
          category_name: productTypeInfo[0].category_name
        },
        price: productTypeInfo[0].price,
        products: products.map(p => ({
          product_id: p.product_id,
          product_code: p.product_code,
          product_name: p.product_name,
          size: p.size,
          color: p.color,
          quantity: p.quantity,
          status: p.status
        })),
        total_products: products.length,
        total_quantity: products.reduce((sum, product) => sum + product.quantity, 0)
      };
  
      return result;
    } catch (error) {
      console.error('Error in getByProductType:', error);
      throw error;
    }
  }

  static async updateStock(productCode, quantity) {
    try {
      const product = await this.getByCode(productCode);
      if (!product) {
        throw new Error(PRODUCT_MESSAGES.NOT_FOUND);
      }

      const newQuantity = product.quantity + quantity;
      const status = newQuantity > 0 ? 'instock' : 'outofstock';

      const [result] = await pool.query(
        'UPDATE Product SET quantity = ?, status = ? WHERE product_code = ?',
        [newQuantity, status, productCode]
      );

      return this.getByCode(productCode);
    } catch (error) {
      console.error('Update stock error:', error);
      throw error;
    }
  }

  static async getByCategory(categoryCode) {
    try {
      // 1. Lấy thông tin Category
      const [categoryInfo] = await pool.query(`
        SELECT * FROM Category WHERE category_code = ?
      `, [categoryCode]);
  
      if (categoryInfo.length === 0) {
        throw new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
      }
  
      // 2. Lấy các ProductType thuộc Category
      const [productTypes] = await pool.query(`
        SELECT pt.*
        FROM ProductType pt
        WHERE pt.category_code = ?
      `, [categoryCode]);
  
      if (productTypes.length === 0) {
        return {
          category_code: categoryInfo[0].category_code,
          category_name: categoryInfo[0].category_name,
          productTypes: [],
          total_product_types: 0,
          total_products: 0,
          total_quantity: 0
        };
      }
  
      // 3. Lấy tất cả sản phẩm thuộc các ProductType của Category
      const productTypeIds = productTypes.map(pt => pt.productType_code);
      const placeholders = productTypeIds.map(() => '?').join(',');
      
      const [products] = await pool.query(`
        SELECT p.*, pt.productType_name, pt.price
        FROM Product p
        JOIN ProductType pt ON p.productType_code = pt.productType_code
        WHERE p.productType_code IN (${placeholders})
        ORDER BY pt.productType_name, p.size
      `, productTypeIds);
  
      // 4. Nhóm sản phẩm theo loại sản phẩm
      const productsByType = {};
      productTypes.forEach(pt => {
        productsByType[pt.productType_code] = {
          productType_code: pt.productType_code,
          productType_name: pt.productType_name,
          price: pt.price,
          products: []
        };
      });
  
      products.forEach(product => {
        const { productType_code } = product;
        
        // Thêm sản phẩm vào nhóm tương ứng
        productsByType[productType_code].products.push({
          product_id: product.product_id,
          product_code: product.product_code,
          product_name: product.product_name,
          size: product.size,
          color: product.color,
          quantity: product.quantity,
          status: product.status
        });
      });
  
      // 5. Format kết quả
      const formattedProductTypes = Object.values(productsByType).map(group => {
        // Sắp xếp sản phẩm theo kích cỡ
        const sortedProducts = group.products.sort((a, b) => {
          const sizePriority = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
          return (sizePriority[a.size] || 99) - (sizePriority[b.size] || 99);
        });
        
        return {
          ...group,
          products: sortedProducts,
          total_products: sortedProducts.length,
          total_quantity: sortedProducts.reduce((sum, product) => sum + product.quantity, 0)
        };
      });
  
      // Tính tổng số sản phẩm và số lượng
      const totalProducts = formattedProductTypes.reduce((sum, pt) => sum + pt.total_products, 0);
      const totalQuantity = formattedProductTypes.reduce((sum, pt) => sum + pt.total_quantity, 0);
  
      return {
        category_code: categoryInfo[0].category_code,
        category_name: categoryInfo[0].category_name,
        productTypes: formattedProductTypes,
        total_product_types: formattedProductTypes.length,
        total_products: totalProducts,
        total_quantity: totalQuantity
      };
    } catch (error) {
      console.error('Error in getByCategory:', error);
      throw error;
    }
  }

  static async searchByName(searchQuery) {
    try {
        const formattedQuery = `%${searchQuery.trim()}%`;
        console.log("🔎 SQL Query Format:", formattedQuery);

        const [products] = await pool.query(`
            SELECT * FROM Product 
            WHERE product_name COLLATE utf8mb4_general_ci LIKE ?`,
            [formattedQuery]
        );

        console.log("📊 Kết quả từ MySQL:", products);
        return products.length ? products : null;
    } catch (error) {
        console.error("❌ Lỗi trong searchByName:", error);
        throw error;
    }
  }

  static async updateProductStatus(product_code) {
    try {
        const [product] = await pool.query(`
            SELECT quantity FROM Product WHERE product_code = ?`, [product_code]);

        if (product.length > 0) {
            const newStatus = product[0].quantity > 0 ? 'instock' : 'outofstock';
            await pool.query(`
                UPDATE Product SET status = ? WHERE product_code = ?`, [newStatus, product_code]);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
        throw error;
    }
}

static async updateProductQuantity(product_code) {
  try {
      const [totalQuantity] = await pool.query(`
          SELECT COALESCE(SUM(quantity), 0) AS total_quantity FROM Stock WHERE product_code = ?`,
          [product_code]
      );

      const newQuantity = totalQuantity[0].total_quantity;
      const newStatus = newQuantity > 0 ? 'instock' : 'outofstock';

      await pool.query(`
          UPDATE Product SET quantity = ?, status = ? WHERE product_code = ?`,
          [newQuantity, newStatus, product_code]
      );
  } catch (error) {
      console.error("Lỗi khi cập nhật tổng số lượng sản phẩm:", error);
      throw error;
  }
}

}

module.exports = Product;