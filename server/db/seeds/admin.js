const bcrypt = require('bcrypt');

exports.seed = function (knex) {
    return knex('admins').del()
        .then(function () {
            const date = new Date();
            return knex('admins').insert([
                {
                    first_name: "master",
                    last_name: 'admin',
                    email: 'master.admin@realestate.com',
                    phone: '1000000001',
                    role: 1,
                    password: bcrypt.hashSync('12345678', 10),
                    is_active: true,
                    created_at: date,
                    updated_at: date
                }
            ])
        })
}