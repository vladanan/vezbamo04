//var mysql = require('mysql');
const mysql = require('mysql2');

var pool = mysql.createPool({
    host: process.env.FREE_MYSQL_HOST,
    port: process.env.FREE_MYSQL_PORT,
    user: process.env.FREE_MYSQL_USER,
    password: process.env.FREE_MYSQL_PASSWORD,
    database: process.env.FREE_MYSQL_DATABASE,
    connectionLimit: 1000,
    debug: false,
    waitForConnections: true,
    queueLimit: 0
});

var getConnection = (function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
});

module.exports = getConnection;

// con.connect(function(err) {
//     //console.log('tests ide se na proveru greške 2');
//     if (err) {
//       //console.log('greška: ' + err);
//       throw err;
//     }
// });

//module.exports = pool;