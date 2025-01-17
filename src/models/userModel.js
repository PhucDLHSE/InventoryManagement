const pool = require('../config/dbConfig');
const { ROLES } = require('../constants/roles');
const { STATUS } = require('../constants/status');
const { USER_MESSAGES } = require('../constants/messages');
const { generateSelectUserFields, generateSelectUserWithPassword } = require('../utils/queryUtils');

class User {
  static async generateUserCode(role_id) {
    let prefix = '';
    switch (role_id) {
      case ROLES.ADMIN:
        prefix = 'AD';
        break;
      case ROLES.MANAGER:
        prefix = 'MA';
        break;
      case ROLES.STAFF:
        prefix = 'ST';
        break;
      default:
        throw new Error(USER_MESSAGES.ROLE_INVALID);
    }

    // Lấy mã code cuối cùng của role tương ứng
    const [lastCode] = await pool.query(
      'SELECT user_code FROM User WHERE user_code LIKE ? ORDER BY user_code DESC LIMIT 1',
      [`${prefix}%`]
    );

    let newNumber = 1;
    if (lastCode[0]) {
      // Lấy 4 số cuối của mã code cuối cùng và tăng lên 1
      const lastNumber = parseInt(lastCode[0].user_code.slice(-4));
      newNumber = lastNumber + 1;
    }

    // Format số thành chuỗi 4 chữ số (vd: 0001, 0012,...)
    const formattedNumber = newNumber.toString().padStart(4, '0');
    return `${prefix}${formattedNumber}`;
  }

  static async getAll() {
    try {
        const [rows] = await pool.query(`
             ${generateSelectUserFields()}
              ORDER BY u.created_at DESC
        `);
        console.log('Query result:', rows); 
        return rows;
    } catch (error) {
        console.error('Error in getAll:', error); 
        throw error;
    }
}

  static async getByCode(userCode) {
    const [rows] = await pool.query(`
      ${generateSelectUserFields()}
            WHERE u.user_code = ?
    `, [userCode]);
    return rows[0];
  } 

  static async findByUsername(username) {
    const [rows] = await pool.query(`
        ${generateSelectUserFields()}
            WHERE u.user_name = ?
    `, [username]);
    return rows[0];
}

  static async findByUsernameWithPassword(username) {
        const [rows] = await pool.query(`
            ${generateSelectUserWithPassword()}
            WHERE u.user_name = ?
        `, [username]);
        return rows[0];
    }

  // Create
  static async create(userData) {
    const { role_id, user_name, fullName, email, password, warehouse_code } = userData;
  
    if (!Object.values(ROLES).includes(role_id)) {
      throw new Error(USER_MESSAGES.ROLE_INVALID);
    }

    const user_code = await this.generateUserCode(role_id);
    const userExists = await this.findByUsername(user_name);
    if (userExists) {
      throw new Error(USER_MESSAGES.USERNAME_EXISTS);
    }
    const status = warehouse_code ? 'active' : 'inactive';

    await pool.query(
      `INSERT INTO User (
        user_id, user_code, role_id, user_name, 
        fullName, email, password, warehouse_code, 
        status
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_code, role_id, user_name, fullName, email, password, warehouse_code || null, status]
    );

    const [newUser] = await pool.query(`${generateSelectUserFields()} WHERE u.user_code = ?`, [user_code]);
    return newUser[0];
  }

  // Update
  static async update(userCode, userData) {
    const updateFields = [];
    const values = [];
    if (userData.fullName !== undefined) {
        updateFields.push('fullName = ?');
        values.push(userData.fullName);
    }
    if (userData.email !== undefined) {
        updateFields.push('email = ?');
        values.push(userData.email);
    } 
    if (userData.password !== undefined) {
        updateFields.push('password = ?');
        values.push(userData.password);
    }
    if (userData.warehouse_code !== undefined) {
        updateFields.push('warehouse_code = ?');
        values.push(userData.warehouse_code || null);
        updateFields.push('status = ?');
        values.push(userData.warehouse_code ? 'active' : 'inactive');
    }
    if (updateFields.length === 0) {
        throw new Error(USER_MESSAGES.NO_UPDATE_DATA);
    }
    values.push(userCode);
    const query = `
        UPDATE User 
        SET ${updateFields.join(', ')}
        WHERE user_code = ?
    `;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
        throw new Error(USER_MESSAGES.CANNOT_UPDATE);
    }

    const [updatedUser] = await pool.query(`${generateSelectUserFields()} WHERE u.user_code = ?`, [userCode]);
    return updatedUser[0];
  }

  // Delete
  static async delete(userCode) {
    const [user] = await pool.query(`${generateSelectUserFields()} WHERE u.user_code = ?`, [userCode]);
    if (!user[0]) {
      throw new Error(USER_MESSAGES.CANNOT_DELETE);
    }

    if (user[0].role_id === ROLES.ADMIN) { 
      const [adminCount] = await pool.query(
        'SELECT COUNT(*) as count FROM User WHERE role_id = ?',
        [ROLES.ADMIN]
      );
    
      if (adminCount[0].count <= 1) {
        throw new Error(USER_MESSAGES.LAST_ADMIN);
      }
    }

    const [warehouseUsers] = await pool.query(
      `SELECT COUNT(*) as count 
      FROM User 
      WHERE warehouse_code = ? AND user_code != ?`,
      [user[0].warehouse_code, userCode]
    );

    if (warehouseUsers[0].count === 0) {
      const message = USER_MESSAGES.WAREHOUSE_MANAGER.replace('{warehouse}', user[0].warehouse_code);
      throw new Error(message);
    }

  
    const [stockCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM productinstock WHERE checked_by = ?',
      [userCode]
    );

    if (stockCheck[0].count > 0) {
      const [otherUser] = await pool.query(
        'SELECT user_code FROM User WHERE warehouse_code = ? AND user_code != ? LIMIT 1',
        [user[0].warehouse_code, userCode]
      );

    await pool.query(
      'UPDATE productinstock SET checked_by = ? WHERE checked_by = ?',
      [otherUser[0].user_code, userCode]
    );
  }

    const [result] = await pool.query('DELETE FROM User WHERE user_code = ?', [userCode]);
    return user[0];
  }

  static async checkUserCodeExists(userCode) {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM User WHERE user_code = ?', [userCode]);
    return rows[0].count > 0;
  }
}

module.exports = User;