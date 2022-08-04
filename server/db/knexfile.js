const path = require('path');
const _ = require('lodash');

module.exports = {
    client: 'mysql',
    connection: {
        host: "localhost",
        user: "root",
        password: "",
        database: "real_estate"
    },
    migrations: {
        tableName: 'migration',
        directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
        directory: path.join(__dirname, 'seeds'),
    },
    wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
