// src/models/categoryModel.js
const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const { CATEGORY_MESSAGES } = require('../constants/messages');

class Category {
    static async generateCategoryCode(categoryName) {
        try {
          const slug = this.convertToSlug(categoryName);
          const [existingCode] = await pool.query(
            "SELECT COUNT(*) as count FROM Category WHERE category_code = ?",
            [slug]
          );
          
          if (existingCode[0].count > 0) {
            const timestamp = Date.now().toString().slice(-3);
            return `${slug}_${timestamp}`;
          }
          
          return slug;
        } catch (error) {
          console.error('Error generating category code:', error);
          throw error;
        }
      }
      static convertToSlug(text) {
        let str = text.toLowerCase();
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        return str.substring(0, 20);
      }

  static async getAll() {
    try {
      const [categories] = await pool.query(`
        SELECT * FROM Category ORDER BY category_name
      `);
      return categories;
    } catch (error) {
      console.error('Lỗi lấy danh sách category:', error);
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
      if (!category_name) {
        throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
      }

      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM Category WHERE category_name = ?',
        [category_name]
      );
      if (existingName[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.NAME_EXISTS);
      }

      const category_id = uuidv4();
      const category_code = await this.generateCategoryCode(category_name);

      await pool.query(
        `INSERT INTO Category (
          category_id, category_code, category_name
        ) VALUES (?, ?, ?)`,
        [category_id, category_code, category_name]
      );

      return this.getByCode(category_code);
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  static async update(categoryCode, categoryData) {
    try {
      const { category_name } = categoryData;
      
      if (!category_name) {
        throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
      }

      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM Category WHERE category_name = ? AND category_code != ?',
        [category_name, categoryCode]
      );
      if (existingName[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.NAME_EXISTS);
      }

      const [result] = await pool.query(
        'UPDATE Category SET category_name = ? WHERE category_code = ?',
        [category_name, categoryCode]
      );

      if (result.affectedRows === 0) {
        throw new Error(CATEGORY_MESSAGES.NOT_FOUND);
      }

      return this.getByCode(categoryCode);
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  static async delete(categoryCode) {
    try {
      const category = await this.getByCode(categoryCode);
      if (!category) {
        throw new Error(CATEGORY_MESSAGES.NOT_FOUND);
      }

      const [productTypeCount] = await pool.query(
        'SELECT COUNT(*) as count FROM ProductType WHERE category_code = ?',
        [categoryCode]
      );
      if (productTypeCount[0].count > 0) {
        throw new Error(CATEGORY_MESSAGES.USED_IN_PRODUCT_TYPE);
      }

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