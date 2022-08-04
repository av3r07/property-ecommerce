exports.seed = function (knex) {
    return knex('filter_categories').del()
        .then(function () {
            const date = new Date();
            return knex('filter_categories').insert([
                {
                    name: 'Price',
                    field_name: "price",
                    placement_order: 1
                },
                {
                    name: 'Bedrooms',
                    field_name: "bedrooms",
                    placement_order: 2
                },
                {
                    name: 'Bathrooms',
                    field_name: "bathrooms",
                    placement_order: 3
                },
                {
                    name: 'Area',
                    field_name: "area",
                    placement_order: 4
                }
            ])
        })
}