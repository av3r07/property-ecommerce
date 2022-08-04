const config = require('./knexfile');

const knex = require('knex')(config); // eslint-disable-line import/order

const init = async () => {
    try {
        await knex.migrate.latest();
        await knex.seed.run();
    } catch (error) {
        process.exitCode = 1;

        throw error;
    } finally {
        knex.destroy();
    }
};

init()
