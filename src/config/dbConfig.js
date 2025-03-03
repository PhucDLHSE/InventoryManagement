const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool kết nối đến database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'InventoryManagement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
  .then(connection => {
    console.log('Kết nối database thành công!');
    connection.release();
  })
  .catch(error => {
    console.error('Không thể kết nối đến database:', error);
  });

module.exports = pool;