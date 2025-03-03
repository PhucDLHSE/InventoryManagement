// src/models/warehouseModel.js
const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const { WAREHOUSE_MESSAGES } = require('../constants/messages');

class Warehouse {
    static async generateWarehouseCode() {
        try {
          const [countResult] = await pool.query(
            "SELECT COUNT(*) as count FROM Warehouse"
          );
          
          const count = countResult[0].count;
          const newNumber = count + 1;
          const newCode = `WH${newNumber.toString().padStart(4, '0')}`;
          const [existingCode] = await pool.query(
            "SELECT COUNT(*) as count FROM Warehouse WHERE warehouse_code = ?",
            [newCode]
          );
          
          if (existingCode[0].count > 0) {
            const timestamp = Date.now().toString().slice(-4);
            return `WH${timestamp}`;
          }
          
          console.log('New warehouse code:', newCode);
          return newCode;
        } catch (error) {
          console.error('Error generating warehouse code:', error);
          throw error;
        }
      }

    static async getAll() {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    w.warehouse_id, w.warehouse_code, w.warehouse_name, w.address,
                    u.user_code, u.full_name, r.role_type
                FROM Warehouse w
                LEFT JOIN User u ON w.warehouse_code = u.warehouse_code
                LEFT JOIN Role r ON u.role_id = r.role_id
                ORDER BY w.warehouse_name, r.role_type
            `);
    
            const warehouseMap = new Map();
    
            rows.forEach(row => {
                if (!warehouseMap.has(row.warehouse_code)) {
                    warehouseMap.set(row.warehouse_code, {
                        warehouse_id: row.warehouse_id,
                        warehouse_code: row.warehouse_code,
                        warehouse_name: row.warehouse_name,
                        address: row.address,
                        users: []
                    });
                }
                if (row.user_code) {
                    warehouseMap.get(row.warehouse_code).users.push({
                        user_code: row.user_code,
                        full_name: row.full_name,
                        role_type: row.role_type
                    });
                }
            });
    
            return Array.from(warehouseMap.values());
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
      }
    
    static async getByCode(warehouse_code) {
      try {
          const [warehouseResult] = await pool.query(`
              SELECT warehouse_id, warehouse_code, warehouse_name, address
              FROM Warehouse
              WHERE warehouse_code = ?
          `, [warehouse_code]);
  
          if (warehouseResult.length === 0) {
              throw new Error("Kho không tồn tại!");
          }
  
          const warehouse = warehouseResult[0];
  
          const [managerResult] = await pool.query(`
              SELECT u.user_id, u.user_code, u.full_name, u.email
              FROM User u
              JOIN Role r ON u.role_id = r.role_id
              WHERE u.warehouse_code = ? AND r.role_type = 'MANAGER'
          `, [warehouse_code]);
  
          const manager = managerResult.length > 0 ? managerResult[0] : null;
  
          const [staffResults] = await pool.query(`
              SELECT u.user_id, u.user_code, u.full_name, u.email
              FROM User u
              JOIN Role r ON u.role_id = r.role_id
              WHERE u.warehouse_code = ? AND r.role_type = 'STAFF'
          `, [warehouse_code]);
  
          return {
                  ...warehouse,
                  ASSIGNED:{
                      manager,
                      staffs: staffResults
                    }
                };
              } catch (error) {
                console.error("Error in getWarehouseByCode:", error);
                throw error;
              }
        }
  
    static async create(warehouseData) {
    try {
      const { warehouse_name, address } = warehouseData;

      // Validation
      if (!warehouse_name || !address) {
        throw new Error(WAREHOUSE_MESSAGES.MISSING_FIELDS);
      }

      // Generate IDs
      const warehouse_id = uuidv4();
      const warehouse_code = await this.generateWarehouseCode();

      // Check if name already exists
      const [existingName] = await pool.query(
        'SELECT COUNT(*) as count FROM Warehouse WHERE warehouse_name = ?',
        [warehouse_name]
      );
      if (existingName[0].count > 0) {
        throw new Error(WAREHOUSE_MESSAGES.NAME_EXISTS);
      }

      // Insert warehouse
      await pool.query(
        `INSERT INTO Warehouse (
          warehouse_id, warehouse_code, warehouse_name, address
        ) VALUES (?, ?, ?, ?)`,
        [warehouse_id, warehouse_code, warehouse_name, address]
      );

      // Return created warehouse
      return this.getByCode(warehouse_code);
    } catch (error) {
      console.error('Create warehouse error:', error);
      throw error;
    }
      }

    static async update(warehouseCode, warehouseData) {
    try {
      const { warehouse_name, address } = warehouseData;
      const updateFields = [];
      const values = [];

      // Validate and build update fields
      if (warehouse_name !== undefined) {
        // Check for duplicate name
        const [existingName] = await pool.query(
          'SELECT COUNT(*) as count FROM Warehouse WHERE warehouse_name = ? AND warehouse_code != ?',
          [warehouse_name, warehouseCode]
        );
        if (existingName[0].count > 0) {
          throw new Error(WAREHOUSE_MESSAGES.NAME_EXISTS);
        }
        updateFields.push('warehouse_name = ?');
        values.push(warehouse_name);
      }

      if (address !== undefined) {
        updateFields.push('address = ?');
        values.push(address);
      }

      if (updateFields.length === 0) {
        throw new Error(WAREHOUSE_MESSAGES.NO_UPDATE_DATA);
      }

      // Add warehouse code to values
      values.push(warehouseCode);

      // Execute update
      const query = `
        UPDATE Warehouse 
        SET ${updateFields.join(', ')}
        WHERE warehouse_code = ?
      `;
      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        throw new Error(WAREHOUSE_MESSAGES.NOT_FOUND);
      }

      // Return updated warehouse
      return this.getByCode(warehouseCode);
    } catch (error) {
      console.error('Update warehouse error:', error);
      throw error;
    }
      }

    static async delete(warehouseCode) {
    try {
      // Check if warehouse exists
      const warehouse = await this.getByCode(warehouseCode);
      if (!warehouse) {
        throw new Error(WAREHOUSE_MESSAGES.NOT_FOUND);
      }

      // Check if warehouse has associated users
      const [usersCount] = await pool.query(
        'SELECT COUNT(*) as count FROM User WHERE warehouse_code = ?',
        [warehouseCode]
      );
      if (usersCount[0].count > 0) {
        throw new Error(WAREHOUSE_MESSAGES.HAS_USERS);
      }

      // Check if warehouse has associated stock
      const [stockCount] = await pool.query(
        'SELECT COUNT(*) as count FROM Stock WHERE warehouse_code = ?',
        [warehouseCode]
      );
      if (stockCount[0].count > 0) {
        throw new Error(WAREHOUSE_MESSAGES.HAS_STOCK);
      }

      // Delete warehouse
      const [result] = await pool.query(
        'DELETE FROM Warehouse WHERE warehouse_code = ?',
        [warehouseCode]
      );

      return warehouse;
    } catch (error) {
      console.error('Delete warehouse error:', error);
      throw error;
    }
      }
}

module.exports = Warehouse;