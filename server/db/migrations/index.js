exports.up = function (knex) {
    return knex.schema
        .createTable('admins', function (table) {
            table.increments('id').primary();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone').notNullable().unique();
            table.string('service_ids');
            table.string('image').defaultTo('');
            table.string('password').notNullable();
            table.integer('role').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone').notNullable().unique();
            table.string('password').notNullable();
            table.string('image').defaultTo('');
            table.integer('role').notNullable();
            table.boolean('is_verified').defaultTo('false');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('service_providers', function (table) {
            table.increments('id').primary();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone').notNullable().unique();
            table.string('password');
            table.string('image').defaultTo('');
            table.integer('role').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_verified').defaultTo(false);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('builders', function (table) {
            table.increments('id').primary();
            table.string('display_name').notNullable();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone').notNullable().unique();
            table.string('address').notNullable();
            table.string('city').notNullable();
            table.string('state').notNullable();
            table.string('country').notNullable();
            table.string('zipcode').notNullable();
            table.string('image').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('user_docs', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.foreign('user_id').references('id').inTable('users');
            table.string('name').notNullable();
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('property_types', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('filter_categories', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('field_name').notNullable().unique();
            table.integer('placement_order').defaultTo(0);
        })
        .createTable('filters', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.integer('type').notNullable();
            table.bigInteger('value');
            table.bigInteger('max_value');
            table.bigInteger('min_value');
            table.integer('placement_order').defaultTo(0);
            table.integer('category_id').unsigned().notNullable();
            table.foreign('category_id').references('id').inTable('filter_categories');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('property_services', function (table) {
            table.increments('id').primary();
            table.string('name').unique().notNullable();
            table.string('icon').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('properties', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('lattitude').notNullable();
            table.string('longitude').notNullable();
            table.string('location_url', 1000).notNullable();
            table.string('address').notNullable();
            table.string('city').notNullable();
            table.string('state').notNullable();
            table.string('country').notNullable();
            table.string('zipcode').notNullable();
            table.bigInteger('price').notNullable();
            table.integer('property_type').unsigned().notNullable();
            table.foreign('property_type').references('id').inTable('property_types');
            table.string('area');
            table.integer('bathrooms');
            table.integer('bedrooms');
            table.string('services_available').notNullable();
            table.integer('units');
            table.integer('views').defaultTo(0);
            table.integer('enquiries').defaultTo(0);
            table.text('description', ['longtext']).notNullable();
            table.integer('builder_id').unsigned();
            table.foreign('builder_id').references('id').inTable('builders');
            table.integer('user_id');
            table.integer('user_role');
            table.string('contact_number').notNullable();
            table.string('contact_email').notNullable();
            table.string('updated_by').notNullable();
            table.string('updated_by_role').notNullable();
            table.string('admin_id');
            table.text('images', ['longtext']).defaultTo('');
            table.string('thumbnail').notNullable();
            table.boolean('is_top').defaultTo(false);
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_approved').defaultTo(false);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('financial_plans_categories', function (table) {
            table.increments('id').primary();
            table.string('name').unique().notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('financial_plans', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.text('description', ['longtext']).notNullable();
            table.bigInteger('price').notNullable();
            table.text('benefits', ['longtext']).notNullable();
            table.text('docs', ['longtext']).notNullable();
            table.boolean('is_active').defaultTo(true);
            table.integer('category_id').unsigned().notNullable();
            table.foreign('category_id').references('id').inTable('financial_plans_categories');
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('financial_plans_pricings', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.bigInteger('price').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.integer('plan_id').unsigned().notNullable();
            table.foreign('plan_id').references('id').inTable('financial_plans');
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })

        .createTable('financial_plans_addons', function (table) {
            table.increments('id').primary();
            table.text('description', ['longtext']).notNullable();
            table.bigInteger('price').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.integer('plan_id').unsigned().notNullable();
            table.foreign('plan_id').references('id').inTable('financial_plans');
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('cases', function (table) {
            table.increments('id').primary();
            table.string('order_id').unique().notNullable()
            table.integer('plan_id').unsigned();
            table.foreign('plan_id').references('id').inTable('financial_plans');
            table.string('message')
            table.integer('user_id').unsigned().notNullable();
            table.foreign('user_id').references('id').inTable('users');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('case_addons', function (table) {
            table.increments('id').primary();
            table.string('order_id').unique().notNullable()
            table.integer('case_id').unsigned().notNullable();
            table.foreign('case_id').references('id').inTable('cases')
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('case_orders', function (table) {
            table.increments('id').primary();
            table.string('order_id').unique().notNullable()
            table.integer('case_id').unsigned().notNullable();
            table.foreign('case_id').references('id').inTable('cases')
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('schedules', function (table) {
            table.increments('id').primary();
            table.integer('day').notNullable();
            table.time('start_time').notNullable();
            table.time('end_time').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
            table.boolean('is_deleted').defaultTo(false);
        })
        .createTable('slots', function (table) {
            table.increments('id').primary();
            table.integer('schedule_id').unsigned().notNullable();
            table.foreign('schedule_id').references('id').inTable('schedules');
            table.time('time').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('appointments', function (table) {
            table.increments('id').primary();
            table.string('appointment_id').unique().notNullable();
            table.integer('slot_id').unsigned().notNullable();
            table.foreign('slot_id').references('id').inTable('slots');
            table.integer('service_id').notNullable();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').unique().notNullable();
            table.string('phone').unique().notNullable();
            table.string('query').notNullable();
            table.date('date').notNullable();
            table.boolean('status').notNullable();
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('enquiries', function (table) {
            table.increments('id').primary();
            table.string('enquiry_id').unique().notNullable();
            table.integer('property_id').unsigned().notNullable();
            table.foreign('property_id').references('id').inTable('properties');
            table.string('email').unique().notNullable();
            table.string('phone').unique().notNullable();
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
        })
        .createTable('testimonials', function (table) {
            table.increments('id').primary();
            table.string('comment', 1000).notNullable();
            table.string('image').notNullable();
            table.string('name').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('faqs', function (table) {
            table.increments('id').primary();
            table.text('answer', ['longtext']).notNullable();
            table.string('question', 1000).notNullable();
            table.integer('service_id').notNullable();
            table.integer('plan_id').unsigned();
            table.foreign('plan_id').references('id').inTable('financial_plans');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());

        })
        .createTable('sessions', function (table) {
            table.increments('id').primary();
            table.integer('user_id').notNullable();
            table.integer('user_role').notNullable();
            table.text('tokens', ["longtext"]).defaultTo('');
        })
        .createTable('orders', function (table) {
            table.increments('id').primary();
            table.string('cf_order_id').notNullable();
            table.string('order_id').notNullable();
            table.string('currency').notNullable();
            table.bigInteger('amount').notNullable();
            table.timestamp('expiry_time').notNullable();
            table.integer('customer_id').unsigned().notNullable();
            table.foreign('customer_id').references('id').inTable('users');
            table.string('customer_name').notNullable();
            table.string('customer_email').notNullable();
            table.string('customer_phone').notNullable();
            table.string('status').notNullable();
            table.string('token').notNullable();
            table.string('payment_link').notNullable();
            table.timestamp('created_at', true).defaultTo(knex.fn.now());
            table.timestamp('updated_at', true).defaultTo(knex.fn.now());
        })
        .createTable('payments', function (table) {
            table.increments('id').primary();
            table.string('cf_payment_id').notNullable();
            table.string('order_id').notNullable();
            table.string('currency').notNullable();
            table.bigInteger('amount').notNullable();
            table.integer('customer_id').unsigned().notNullable();
            table.foreign('customer_id').references('id').inTable('users');
            table.string('customer_name').notNullable();
            table.string('customer_email').notNullable();
            table.string('customer_phone').notNullable();
            table.string('status').notNullable();
            table.string('group').notNullable();
            table.timestamp('time').notNullable();
        })
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('admins')
        .dropTable("users")
        .dropTable("service_providers")
        .dropTable('builders')
        .dropTable("documents")
        .dropTable('user_docs')
        .dropTable("property_types")
        .dropTable('room_types')
        .dropTable("filter_categories")
        .dropTable("filter_lists")
        .dropTable('property_services')
        .dropTable("properties")
        .dropTable("inancial_plans_categories")
        .dropTable("financial_plans")
        .dropTable("cases")
        .dropTable("case_addons")
        .dropTable("case_orders")
        .dropTable("comments")
        .dropTable("schedules")
        .dropTable("slots")
        .dropTable('appointments')
        .dropTable("testimonials")
        .dropTable('faqs')
        .dropTable('sessions')
        .dropTable('payments')
        .dropTable('orders')
        .dropTable('financial_plans_addons')
        .dropTable('enquiries')
};