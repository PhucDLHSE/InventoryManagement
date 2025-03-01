// src/models/categoryModel.js
const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const { CATEGORY_MESSAGES } = require('../constants/messages');

class Category {
    static async generateCategoryCode(categoryName) {
        try {
          // Chuyển đổi tên thành tiếng Việt không dấu và lowercase
          const slug = this.convertToSlug(categoryName);
          
          // Kiểm tra xem mã đã tồn tại chưa
          const [existingCode] = await pool.query(
            "SELECT COUNT(*) as count FROM Category WHERE category_code = ?",
            [slug]
          );
          
          if (existingCode[0].count > 0) {
            // Nếu mã đã tồn tại, thêm timestamp để đảm bảo duy nhất
            const timestamp = Date.now().toString().slice(-3);
            return `${slug}_${timestamp}`;
          }
          
          return slug;
        } catch (error) {
          console.error('Error generating category code:', error);
          throw error;
        }
      }
      
      // Hàm chuyển đổi tiếng Việt có dấu thành không dấu và format chuỗi
      static convertToSlug(text) {
        // Chuyển sang chữ thường và loại bỏ dấu
        let str = text.toLowerCase();
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Thay thế dấu cách bằng dấu gạch dưới và loại bỏ ký tự đặc biệt
        str = str.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        
        // Giới hạn độ dài để mã không quá dài
        return str.substring(0, 20);
      }

  static async getAll() {
    try {
      const [categories] = await pool.query(`
        SELECT * FROM Category ORDER BY category_name
      `);
      return categories;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  static async getByCode(categoryCode) {
    const [rows] = await pool.query(
      'SELECT * FROM Category WHERE category_code = ?',
      [categoryCode]
    );
    return rows[0];
  }

  static async create(categoryData) {
    try {
      const { category_name } = categoryData;

      // Validation
      if (!category_name) {
        throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
      }

      // Check if name already exists
      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM Category WHERE category_name = ?',
        [category_name]
      );
      if (existingName[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.NAME_EXISTS);
      }

      // Generate ID and code
      const category_id = uuidv4();
      const category_code = await this.generateCategoryCode(category_name);

      // Insert category
      await pool.query(
        `INSERT INTO Category (
          category_id, category_code, category_name
        ) VALUES (?, ?, ?)`,
        [category_id, category_code, category_name]
      );

      // Return created category
      return this.getByCode(category_code);
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  static async update(categoryCode, categoryData) {
    try {
      const { category_name } = categoryData;
      
      // Validation
      if (!category_name) {
        throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
      }

      // Check for duplicate name
      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM Category WHERE category_name = ? AND category_code != ?',
        [category_name, categoryCode]
      );
      if (existingName[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.NAME_EXISTS);
      }

      // Execute update
      const [result] = await pool.query(
        'UPDATE Category SET category_name = ? WHERE category_code = ?',
        [category_name, categoryCode]
      );

      if (result.affectedRows === 0) {
        throw new Error(CATEGORY_MESSAGES.NOT_FOUND);
      }

      // Return updated category
      return this.getByCode(categoryCode);
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  static async delete(categoryCode) {
    try {
      // Check if category exists
      const category = await this.getByCode(categoryCode);
      if (!category) {
        throw new Error(CATEGORY_MESSAGES.NOT_FOUND);
      }

      // Check if category is being used in ProductType
      const [productTypeCount] = await pool.query(
        'SELECT COUNT(*) as count FROM ProductType WHERE category_code = ?',
        [categoryCode]
      );
      if (productTypeCount[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.USED_IN_PRODUCT_TYPE);
      }

      // Delete category
      const [result] = await pool.query(
        'DELETE FROM Category WHERE category_code = ?',
        [categoryCode]
      );

      return category;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }
}

module.exports = Category;