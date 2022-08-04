const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "real_estate"
});

connection.connect(function (err) {
    if (err) {
        console.log('database connection error')
    } else {
        console.log('database connected')
    }
});

module.exports = connection;