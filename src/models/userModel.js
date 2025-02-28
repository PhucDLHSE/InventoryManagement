const pool = require('../config/dbConfig');
const ROLES  = require('../constants/roles');
const { STATUS } = require('../constants/status');
const { USER_MESSAGES } = require('../constants/messages');
const { generateSelectUserFields, generateSelectUserWithPassword } = require('../utils/queryUtils');
const { v4: uuidv4 } = require('uuid');

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
  
    static async countUsersByRole(warehouse_code, role_id) {
      try {
          const [result] = await pool.query(
              'SELECT COUNT(*) as count FROM User WHERE warehouse_code = ? AND role_id = ?',
              [warehouse_code, role_id]
          );
          return result[0].count;
      } catch (error) {
          console.error('Error in countUsersByRole:', error);
          throw error;
      }
  }
  

  // Create
    static async create(userData) {
    const user_id = uuidv4();
    try {
        const { 
            role_id, 
            user_name, 
            fullName, 
            email, 
            password, 
            warehouse_code = null 
        } = userData;

        // Validate role_id
        const validRoles = Object.values(ROLES);
        if (!role_id || !validRoles.includes(role_id)) {
            throw new Error(USER_MESSAGES.ROLE_INVALID);
        }

        const userExists = await this.findByUsername(user_name);
        if (userExists) {
            throw new Error(USER_MESSAGES.USERNAME_EXISTS);
        }

        // Generate user_code
        const user_code = await this.generateUserCode(role_id);
        
        // Generate UUID for user_id
        const user_id = `U${Date.now()}`; 

        // Insert user
        await pool.query(
            `INSERT INTO User (
                user_id, user_code, role_id, user_name, 
                fullName, email, password, warehouse_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, user_code, role_id, user_name, fullName, email, password, warehouse_code]
        );

        const [newUser] = await pool.query(
            `${generateSelectUserFields()} WHERE u.user_code = ?`, 
            [user_code]
        );
        return newUser[0];

    } catch (error) {
        console.error("Create user error:", error);
        throw error;
    }
  }

  //Update
  static async update(userCode, userData) {
    const updateFields = [];
    const values = [];

    // Lấy thông tin user hiện tại
    const existingUser = await User.getByCode(userCode);
    if (!existingUser) {
        throw new Error(USER_MESSAGES.CANNOT_UPDATE);
    }

    // Kiểm tra nếu đang cập nhật warehouse_code
    if (userData.warehouse_code !== undefined) {
        const { warehouse_code } = userData;

        // Nếu user có warehouse_code mới, kiểm tra số lượng Manager & Staff
        if (warehouse_code) {
            const managerCount = await User.countUsersByRole(warehouse_code, 'MA2');
            const staffCount = await User.countUsersByRole(warehouse_code, 'ST3');

            // Nếu user là Manager và warehouse đã có 1 Manager khác -> Lỗi
            if (existingUser.role_id === 'MA2' && managerCount >= 1) {
                throw new Error("Nhà kho này đã có người quản lý!");
            }

            // Nếu user là Staff và warehouse đã có 5 Staff -> Lỗi
            if (existingUser.role_id === 'ST3' && staffCount >= 5) {
                throw new Error("Đã đạt giới hạn nhân viên trong nhà kho này!");
            }
        }

        updateFields.push('warehouse_code = ?');
        values.push(warehouse_code || null);

        updateFields.push('status = ?');
        values.push(warehouse_code ? 'active' : 'inactive');
    }

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

  // Kiểm tra nếu user là admin cuối cùng
  if (user[0].role_id === ROLES.ADMIN) { 
    const [adminCount] = await pool.query(
      'SELECT COUNT(*) as count FROM User WHERE role_id = ?',
      [ROLES.ADMIN]
    );
  
    if (adminCount[0].count <= 1) {
      throw new Error(USER_MESSAGES.LAST_ADMIN);
    }
  }

  // Chỉ kiểm tra warehouse nếu user được gán warehouse
  if (user[0].warehouse_code) {
    const [warehouseUsers] = await pool.query(
      `SELECT COUNT(*) as count 
      FROM User 
      WHERE warehouse_code = ? AND user_code != ?`,
      [user[0].warehouse_code, userCode]
    );

    // Chỉ không cho xóa nếu user là người duy nhất quản lý warehouse
    if (warehouseUsers[0].count === 0) {
      const message = USER_MESSAGES.WAREHOUSE_MANAGER.replace('{warehouse}', user[0].warehouse_code);
      throw new Error(message);
    }
  }

  // Kiểm tra nếu user đang quản lý StockCheckNote
  try {
    const [stockCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM StockCheckNote WHERE checker = ?',
      [userCode]
    );

    if (stockCheck[0].count > 0) {
      throw new Error(USER_MESSAGES.USER_HAS_STOCKCHECK);
    }
  } catch (error) {
    // Bỏ qua lỗi nếu bảng không tồn tại
    console.log("StockCheckNote check error:", error.message);
  }

  // Xóa user
  const [result] = await pool.query('DELETE FROM User WHERE user_code = ?', [userCode]);
  return user[0];
}

  static async checkUserCodeExists(userCode) {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM User WHERE user_code = ?', [userCode]);
    return rows[0].count > 0;
  }
}

module.exports = User;