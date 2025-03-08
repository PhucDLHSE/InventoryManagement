const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const { PRODUCT_TYPE_MESSAGES } = require('../constants/messages');
const Category = require('./categoryModel');

class ProductType {
  static async generateProductTypeCode() {
    try {
      const [lastCode] = await pool.query(
        'SELECT productType_code FROM ProductType ORDER BY productType_code DESC LIMIT 1'
      );

      let newCode = 'PT0001';
      if (lastCode[0]) {
        const lastNumber = parseInt(lastCode[0].productType_code.substring(2));
        newCode = `PT${(lastNumber + 1).toString().padStart(4, '0')}`;
      }

      return newCode;
    } catch (error) {
      console.error('Error generating productType code:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
        const [rows] = await pool.query(`
            SELECT pt.productType_id, pt.productType_code, pt.productType_name, pt.price, 
                   c.category_code, c.category_name
            FROM ProductType pt
            JOIN Category c ON pt.category_code = c.category_code
            ORDER BY c.category_code, pt.productType_code
        `);
        const categoriesMap = new Map();

        rows.forEach(row => {
            const { category_code, category_name, ...productType } = row;

            if (!categoriesMap.has(category_code)) {
                categoriesMap.set(category_code, {
                    category_code,
                    category_name,
                    product_types: []
                });
            }

            categoriesMap.get(category_code).product_types.push(productType);
        });

        return {
            success: true,
            message: "Lấy tất cả loại sản phẩm thành công",
            data: Array.from(categoriesMap.values())
        };
    } catch (error) {
        console.error("Error in getAllProductTypes:", error);
        throw error;
    }
}


  static async getByCode(productTypeCode) {
    try {
      const [rows] = await pool.query(`
        SELECT pt.*, c.category_name
        FROM ProductType pt
        JOIN Category c ON pt.category_code = c.category_code
        WHERE pt.productType_code = ?
      `, [productTypeCode]);
      const categoriesMap = new Map();

        rows.forEach(row => {
            const { category_code, category_name, ...productType } = row;

            if (!categoriesMap.has(category_code)) {
                categoriesMap.set(category_code, {
                    category_code,
                    category_name,
                    product_types: []
                });
            }

            categoriesMap.get(category_code).product_types.push(productType);
        });

        return {
            success: true,
            message: "Lấy tất cả loại sản phẩm thành công",
            data: Array.from(categoriesMap.values())
        };
    } catch (error) {
      console.error('Error in getByCode:', error);
      throw error;
    }
  }

  static async create(productTypeData) {
    try {
      const { productType_name, price = null, category_code } = productTypeData;

      // Validation
      if (!productType_name || !category_code) {
        throw new Error(PRODUCT_TYPE_MESSAGES.MISSING_FIELDS);
      }

      // Check if category exists
      const category = await Category.getByCode(category_code);
      if (!category) {
        throw new Error(PRODUCT_TYPE_MESSAGES.CATEGORY_NOT_FOUND);
      }

      // Check if name already exists
      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM ProductType WHERE productType_name = ?',
        [productType_name]
      );
      if (existingName[0].count > 0) {
        throw new Error(PRODUCT_TYPE_MESSAGES.NAME_EXISTS);
      }

      // Generate IDs
      const productType_id = uuidv4();
      const productType_code = await this.generateProductTypeCode();

      // Insert productType
      await pool.query(
        `INSERT INTO ProductType (
          productType_id, productType_code, productType_name, price, category_code
        ) VALUES (?, ?, ?, ?, ?)`,
        [productType_id, productType_code, productType_name, price, category_code]
      );

      // Return created productType
      return this.getByCode(productType_code);
    } catch (error) {
      console.error('Create productType error:', error);
      throw error;
    }
  }

  static async update(productTypeCode, productTypeData) {
    try {
      const { productType_name, price, category_code } = productTypeData;
      const updateFields = [];
      const values = [];

      // Build update fields
      if (productType_name !== undefined) {
        // Check for duplicate name
        const [existingName] = await pool.query(
          'SELECT COUNT(*) as count FROM ProductType WHERE productType_name = ? AND productType_code != ?',
          [productType_name, productTypeCode]
        );
        if (existingName[0].count > 0) {
          throw new Error(PRODUCT_TYPE_MESSAGES.NAME_EXISTS);
        }
        updateFields.push('productType_name = ?');
        values.push(productType_name);
      }

      if (price !== undefined) {
        updateFields.push('price = ?');
        values.push(price);
      }

      if (category_code !== undefined) {
        // Check if category exists
        const category = await Category.getByCode(category_code);
        if (!category) {
          throw new Error(PRODUCT_TYPE_MESSAGES.CATEGORY_NOT_FOUND);
        }
        updateFields.push('category_code = ?');
        values.push(category_code);
      }

      if (updateFields.length === 0) {
        throw new Error(PRODUCT_TYPE_MESSAGES.NO_UPDATE_DATA);
      }

      // Add productTypeCode to values
      values.push(productTypeCode);

      // Execute update
      const query = `
        UPDATE ProductType 
        SET ${updateFields.join(', ')}
        WHERE productType_code = ?
      `;
      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        throw new Error(PRODUCT_TYPE_MESSAGES.NOT_FOUND);
      }

      // Return updated productType
      return this.getByCode(productTypeCode);
    } catch (error) {
      console.error('Update productType error:', error);
      throw error;
    }
  }

  static async delete(productTypeCode) {
    try {
      // Check if productType exists
      const productType = await this.getByCode(productTypeCode);
      if (!productType) {
        throw new Error(PRODUCT_TYPE_MESSAGES.NOT_FOUND);
      }

      // Check if productType is being used in Product
      const [productCount] = await pool.query(
        'SELECT COUNT(*) as count FROM Product WHERE productType_code = ?',
        [productTypeCode]
      );
      if (productCount[0].count > 0) {
        throw new Error(PRODUCT_TYPE_MESSAGES.USED_IN_PRODUCT);
      }

      // Delete productType
      const [result] = await pool.query(
        'DELETE FROM ProductType WHERE productType_code = ?',
        [productTypeCode]
      );

      return productType;
    } catch (error) {
      console.error('Delete productType error:', error);
      throw error;
    }
  }

  static async getByCategory(categoryCode) {
    try {
      const [rows] = await pool.query(`
        SELECT pt.*, c.category_name
        FROM ProductType pt
        JOIN Category c ON pt.category_code = c.category_code
        WHERE pt.category_code = ?
        ORDER BY pt.productType_name
      `, [categoryCode]);
      const categoriesMap = new Map();

        rows.forEach(row => {
            const { category_code, category_name, ...productType } = row;

            if (!categoriesMap.has(category_code)) {
                categoriesMap.set(category_code, {
                    category_code,
                    category_name,
                    product_types: []
                });
            }

            categoriesMap.get(category_code).product_types.push(productType);
        });

        return Array.from(categoriesMap.values());
    } catch (error) {
      console.error('Error in getByCategory:', error);
      throw error;
    }
  }
}

module.exports = ProductType;