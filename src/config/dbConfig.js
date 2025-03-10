const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

// Ưu tiên dùng DATABASE_URL của Railway
if (process.env.DATABASE_URL) {
  console.log('Sử dụng DATABASE_URL để kết nối');
  
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} 
// Sau đó kiểm tra các biến riêng lẻ
else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
  console.log('Sử dụng cấu hình cơ sở dữ liệu từ biến môi trường');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}
// Cuối cùng dùng giá trị mặc định
else {
  console.log('Sử dụng cấu hình cơ sở dữ liệu mặc định');
  
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'InventoryManagement',
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
    console.error('Chi tiết lỗi:', error.message);
  });

module.exports = pool;