const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'swd392-mysql-server.mysql.database.azure.com',
  user: process.env.DB_USER || 'duongtb',
  password: process.env.DB_PASSWORD || '17122004Admin',
  database: process.env.DB_NAME || 'inventorymanagement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true, // Bắt buộc sử dụng SSL
  }
});

// Kiểm tra kết nối
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối database thành công!');
    connection.release();
  } catch (error) {
    console.error('❌ Không thể kết nối đến database:', error);
  }
})();

module.exports = pool;
