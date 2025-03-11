const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  console.log('Sử dụng DATABASE_URL để kết nối');
  
  // Sử dụng URL trực tiếp thay vì đối tượng cấu hình
  pool = mysql.createPool(process.env.DATABASE_URL);
} 
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

module.exports = pool;