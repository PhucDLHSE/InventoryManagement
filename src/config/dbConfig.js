require('dotenv').config(); 
const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8_general_ci'
};

const connection = mysql.createConnection(dbConfig);

connection.connect(function(err) {
  if (err) {
    console.error('Connect error: ' + err.stack);
    return;
  }
  console.log('Failed to connect database: ' + connection.threadId);
});

module.exports = connection;
