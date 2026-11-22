//this file exports a MySQL database connection

const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Clubu123!',
    database: 'clubu_db'
});
