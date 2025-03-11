const pool = require('../config/dbConfig');
const ROLES  = require('../constants/roles');
const { STATUS } = require('../constants/status');
const { USER_MESSAGES } = require('../constants/messages');
const { ROLE_TYPES } = require('../constants/roles');
const { generateSelectUserFields, generateSelectUserWithPassword } = require('../utils/queryUtils');
const { v4: uuidv4 } = require('uuid');

class User {
  static async generateUserCode(role_type) {
    let prefix = '';
    switch (role_type) {
      case ROLE_TYPES.ADMIN:
        prefix = 'AD';
        break;
      case ROLE_TYPES.MANAGER:
        prefix = 'MA';
        break;
      case ROLE_TYPES.STAFF:
        prefix = 'ST';
        break;
      default:
        throw new Error(USER_MESSAGES.ROLE_TYPE_INVALID);
    }
  
    const [lastCode] = await pool.query(
      'SELECT user_code FROM User WHERE user_code LIKE ? ORDER BY user_code DESC LIMIT 1',
      [`${prefix}%`]
    );
  
    let newNumber = 1;
    if (lastCode[0]) {
      const lastNumber = parseInt(lastCode[0].user_code.slice(-4));
      newNumber = lastNumber + 1;
    }
  
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
        const formattedResponse = {
            success: true,
            users: rows.map(user => ({
                user_id: user.user_id,
                user_code: user.user_code,
                user_name: user.user_name,
                full_name: user.full_name,
                email: user.email,
                role: {
                    role_id: user.role_id,
                    role_name: user.role_name,
                    role_type: user.role_type
                },
                status: user.status,
                warehouse: user.warehouse_code
                    ? {
                        warehouse_code: user.warehouse_code,
                        warehouse_name: user.warehouse_name,
                        address: user.address
                    }
                    : null,
                created_at: new Date(user.created_at).toISOString(),
                updated_at: new Date(user.updated_at).toISOString()
            }))
        };

        return formattedResponse;
    } catch (error) {
        console.error('Không thể lấy danh sách người dùng:', error); 
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
  
  static async countUsersByRole(warehouse_code, role_type) {
      try {
          const [result] = await pool.query(
              'SELECT COUNT(*) as count FROM User WHERE warehouse_code = ? AND role_type = ?',
              [warehouse_code, role_type]
          );
          return result[0].count;
      } catch (error) {
          console.error('Error in countUsersByRole:', error);
          throw error;
      }
  }
  

  // Create
  static async create(userData) {
    try {
      // Check required fields (chắc chắn tên trường khớp với request)
      const requiredFields = ['role_type', 'user_name', 'full_name', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const { role_type, user_name, full_name, email, password, warehouse_code = null } = userData;
      
      // Validate role_type
      if (!Object.values(ROLE_TYPES).includes(role_type)) {
        throw new Error(USER_MESSAGES.ROLE_TYPE_INVALID);
      }
  
      // Get role_id from role_type
      const [roleResult] = await pool.query(
        'SELECT role_id FROM Role WHERE role_type = ?',
        [role_type]
      );
      
      if (!roleResult[0]) {
        throw new Error(USER_MESSAGES.ROLE_TYPE_INVALID);
      }
      
      const role_id = roleResult[0].role_id;
  
      // Check if username exists
      const userExists = await this.findByUsername(user_name);
      if (userExists) {
        throw new Error(USER_MESSAGES.USERNAME_EXISTS);
      }
  
      // Generate user_code based on role_type
      const user_code = await this.generateUserCode(role_type);
      
      // Generate UUID for user_id
      const user_id = uuidv4();
  
      // Set status based on warehouse_code
      const status = warehouse_code ? STATUS.ACTIVE : STATUS.INACTIVE;
  
      // Insert user
      await pool.query(
        `INSERT INTO User (
          user_id, user_code, role_id, user_name, 
          full_name, email, password, warehouse_code, 
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, user_code, role_id, user_name, full_name, email, password, warehouse_code, status]
      );
  
      // Return created user
      return this.getByCode(user_code);
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
    // Kiểm tra số lượng Manager và Staff trong warehouse
if (userData.warehouse_code !== undefined) {
  const { warehouse_code } = userData;

  if (warehouse_code) {
      // Truy vấn số lượng Manager trong warehouse
      const [managerCountResult] = await pool.query(`
          SELECT COUNT(*) as count 
          FROM User u
          JOIN Role r ON u.role_id = r.role_id
          WHERE u.warehouse_code = ? AND r.role_type = 'MANAGER'
      `, [warehouse_code]);
      const managerCount = managerCountResult[0].count;

      // Truy vấn số lượng Staff trong warehouse
      const [staffCountResult] = await pool.query(`
          SELECT COUNT(*) as count 
          FROM User u
          JOIN Role r ON u.role_id = r.role_id
          WHERE u.warehouse_code = ? AND r.role_type = 'STAFF'
      `, [warehouse_code]);
      const staffCount = staffCountResult[0].count;

      // Kiểm tra nếu user là Manager và warehouse đã có 1 Manager khác -> Lỗi
      if (existingUser.role_type === 'MANAGER' && managerCount >= 1) {
          throw new Error("Nhà kho này đã có người quản lý!");
      }

      // Kiểm tra nếu user là Staff và warehouse đã có 3 Staff -> Lỗi
      if (existingUser.role_type === 'STAFF' && staffCount >= 3) {
          throw new Error("Đã đạt giới hạn nhân viên trong nhà kho này!");
      }
  }

  updateFields.push('warehouse_code = ?');
  values.push(warehouse_code || null);

  updateFields.push('status = ?');
  values.push(warehouse_code ? 'active' : 'inactive');
}


    if (userData.full_name !== undefined) {
        updateFields.push('full_name = ?');
        values.push(userData.full_name);
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
  if (user[0].role_type === ROLE_TYPES.ADMIN) { 
  const [adminCount] = await pool.query(
    'SELECT COUNT(*) as count FROM User u JOIN Role r ON u.role_id = r.role_id WHERE r.role_type = ?',
    [ROLE_TYPES.ADMIN]
  );

  if (adminCount[0].count <= 1) {
    throw new Error(USER_MESSAGES.LAST_ADMIN);
  }
}

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