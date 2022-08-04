const config = require('./knexfile');

const knex = require('knex')(config); // eslint-disable-line import/order

const init = async () => {
    try {
        // const isExists = await knex.schema.hasTable(config.migrations.tableName);
        const isExists = await knex.schema.hasTable('users');
        if (isExists !== true) {
            console.log("user_table does not exist so running iniitdb");
            await knex.raw("drop schema public cascade; create schema public;")
            await knex.migrate.latest();
            await knex.seed.run();
        }
        else {
            console.log("user_table exists so not rinning initdb");
        }
    } catch (error) {
        process.exitCode = 1;

        throw error;
    } finally {
        knex.destroy();
    }
};

init()
