const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

// Kiểm tra xem có DATABASE_URL (được cung cấp bởi Railway) không
if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  // Sử dụng connection string từ Railway
  const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
  console.log('Sử dụng DATABASE_URL để kết nối');
  
  pool = mysql.createPool(connectionString);
} else {
  // Sử dụng các thông số riêng lẻ cho môi trường phát triển
  console.log('Sử dụng cấu hình cơ sở dữ liệu cục bộ');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'InventoryManagement',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

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