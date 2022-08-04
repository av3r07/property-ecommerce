const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');


exports.addProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            const user = res.locals.user;
            if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) || user.role === 4) {
                const {
                    name,
                    address,
                    city,
                    state,
                    country,
                    zipcode,
                    price,
                    area,
                    services_available,
                    description,
                    contact_number,
                    contact_email,
                    location_url
                } = req.body;
                const builder_id = parseInt(req.body.builder_id) || null;
                let admin_id = parseInt(req.body.admin_id) || null;
                const property_type = parseInt(req.body.property_type) || null;
                const bedrooms = parseInt(req.body.bedrooms) || null;
                const bathrooms = parseInt(req.body.bathrooms) || null;
                const units = parseInt(req.body.units) || null;

                const user_id = user.id;
                const user_role = user.role;

                if (user_role === 3) {
                    admin_id = user_id;
                }

                let sql;
                let images = "";
                if (req.files.images && req.files.images.length > 0) {
                    images = req.files.images.map(image => image.filename).join();
                }

                const thumbnail = req.files.thumbnail[0].filename;


                const regex = new RegExp('@(.*),(.*),');
                let locationMatch = location_url.match(regex);
                if (locationMatch) {
                    const lattitude = location_url.match(regex)[1] ? location_url.match(regex)[1] : null;
                    const longitude = location_url.match(regex)[2] ? location_url.match(regex)[2] : null;

                    if (lattitude && longitude && typeof parseInt(lattitude) === 'number' && typeof parseInt(longitude) === 'number') {
                        async.waterfall([
                            callback => {
                                async.parallel([
                                    cb => {
                                        if ((user.role === 1 || user.role === 2) && admin_id) {
                                            sql = "SELECT `is_active`, `service_ids`, `role` FROM `admins` WHERE `id` = ?";
                                            connection.query(sql, [admin_id], (err, result) => {
                                                cb(err, result)
                                            })
                                        } else {
                                            cb(null);
                                        }
                                    },
                                    cb => {
                                        if (builder_id) {
                                            sql = "SELECT `is_active` FROM `builders` WHERE `id` = ?";
                                            connection.query(sql, [builder_id], (err, result) => {
                                                cb(err, result);
                                            })
                                        } else {
                                            cb(null);
                                        }
                                    },
                                    cb => {
                                        sql = "SELECT `is_active` FROM `property_types` WHERE `id` = ?";
                                        connection.query(sql, [property_type], (err, result) => {
                                            cb(err, result)
                                        })
                                    }
                                ], (err, results) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if ((user.role === 1 || user.role === 2) && admin_id) {
                                            if (results[0] && results[0][0]) {
                                                if (results[0][0].is_active === 1) {
                                                    if (results[0][0].service_ids.split(',').indexOf('1') === -1 || results[0][0].role !== 3) {
                                                        res.status(400).send({
                                                            message: 'not a valid admin'
                                                        })
                                                    } else {
                                                        if (builder_id) {
                                                            if (results[1] && results[1][0]) {
                                                                if (results[1][0].is_active === 1) {
                                                                    if (results[2] && results[2][0]) {
                                                                        if (results[2][0].is_active === 1) {
                                                                            callback(null)
                                                                        } else {
                                                                            res.status(400).send({
                                                                                message: 'property type has been deactivated'
                                                                            })
                                                                        }
                                                                    } else {
                                                                        res.status(400).send({
                                                                            message: 'property type not found'
                                                                        })
                                                                    }
                                                                } else {
                                                                    res.status(400).send({
                                                                        message: 'builder has been deactivated'
                                                                    })
                                                                }
                                                            } else {
                                                                res.status(400).send({
                                                                    message: 'builder not found'
                                                                })
                                                            }
                                                        } else {
                                                            if (results[2] && results[2][0]) {
                                                                if (results[2][0].is_active === 1) {
                                                                    callback(null)
                                                                } else {
                                                                    res.status(400).send({
                                                                        message: 'property type has been deactivated'
                                                                    })
                                                                }
                                                            } else {
                                                                res.status(400).send({
                                                                    message: 'property type not found'
                                                                })
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    res.status(400).send({
                                                        message: 'admin has been deactivated'
                                                    })
                                                }
                                            } else {
                                                res.status(400).send({
                                                    message: 'admin not found'
                                                })
                                            }
                                        } else {
                                            if (builder_id) {
                                                if (results[1] && results[1][0]) {
                                                    if (results[1][0].is_active === 1) {
                                                        if (results[2] && results[2][0]) {
                                                            if (results[2][0].is_active === 1) {
                                                                callback(null)
                                                            } else {
                                                                res.status(400).send({
                                                                    message: 'property type has been deactivated'
                                                                })
                                                            }
                                                        } else {
                                                            res.status(400).send({
                                                                message: 'property type not found'
                                                            })
                                                        }
                                                    } else {
                                                        res.status(400).send({
                                                            message: 'builder has been deactivated'
                                                        })
                                                    }
                                                } else {
                                                    res.status(400).send({
                                                        message: 'builder not found'
                                                    })
                                                }
                                            } else {
                                                if (results[2] && results[2][0]) {
                                                    if (results[2][0].is_active === 1) {
                                                        callback(null)
                                                    } else {
                                                        res.status(400).send({
                                                            message: 'property type has been deactivated'
                                                        })
                                                    }
                                                } else {
                                                    res.status(400).send({
                                                        message: 'property type not found'
                                                    })
                                                }
                                            }
                                        }
                                    }
                                })
                            },
                            callback => {
                                let is_approved = 0;

                                if (user.role === 1 || user.role === 2) {
                                    is_approved = 1;
                                }

                                const updated_by = user.first_name + " " + user.last_name;
                                const updated_by_role = (user.role === 1 || user.role === 2) ? 'Super Admin' : ((user.role === 3 ? "Admin" : "Service Provider"))

                                sql = "INSERT INTO `properties` (`name`, `lattitude`, `longitude`,`location_url`, `address`, `city`, `state`, `country`, `zipcode`, `price`, `area`, `bathrooms`, `bedrooms`, `property_type`, `services_available`, `units`, `description`, `builder_id`, `contact_number`, `contact_email`, `thumbnail`,`user_id`, `user_role`, `is_approved`, `is_active`, `images`, `updated_by`, `updated_by_role`, `admin_id`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,NOW(),NOW())";
                                connection.query(sql, [name, lattitude, longitude, location_url, address, city, state, country, zipcode, price, area, bathrooms, bedrooms, property_type, services_available, units, description, builder_id, contact_number, contact_email, thumbnail, user_id, user_role, is_approved, images, updated_by, updated_by_role, admin_id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        callback(null);
                                    }
                                })
                            }
                        ], (err) => {
                            if (err) {
                                console.log(err)
                                res.status(400).send({
                                    message: 'some error occured'
                                })
                            } else {
                                res.status(200).send({
                                    message: 'property added successfully'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            message: 'inavalid location'
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'inavalid location'
                    })
                }

            } else {
                res.status(403).send({
                    message: 'not authorized'
                })
            }
        } else {
            res.status(400).send({
                message: 'Thumbnail is required'
            })
        }
    }
}


exports.editProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        let thumbnail = "";
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            thumbnail = req.files.thumbnail[0].filename
        } else {
            thumbnail = req.body.thumbnail;
        }
        if (thumbnail) {
            const user = res.locals.user;
            if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) || user.role === 4) {
                const {
                    name,
                    location_url,
                    address,
                    city,
                    state,
                    country,
                    zipcode,
                    price,
                    services_available,
                    area,
                    description,
                    contact_number,
                    contact_email,
                } = req.body;

                let images = req.body.images || "";

                if (req.files.new_images && req.files.new_images.length > 0) {
                    if (images && images.length > 0) {
                        images += "," + req.files.new_images.map(image => image.filename).join();
                    } else {
                        images += req.files.new_images.map(image => image.filename).join();
                    }
                }

                const builder_id = parseInt(req.body.builder_id) || null;
                const admin_id = parseInt(req.body.admin_id) || null;
                const property_type = parseInt(req.body.property_type) || null;
                const bedrooms = parseInt(req.body.bedrooms) || null;
                const bathrooms = parseInt(req.body.bathrooms) || null;
                const units = parseInt(req.body.units) || null;

                const id = req.params.id;
                let sql;

                const regex = new RegExp('@(.*),(.*),');
                let locationMatch = location_url.match(regex);
                if (locationMatch) {
                    const lattitude = location_url.match(regex)[1] ? location_url.match(regex)[1] : null;
                    const longitude = location_url.match(regex)[2] ? location_url.match(regex)[2] : null;

                    if (lattitude && longitude && typeof parseInt(lattitude) === 'number' && typeof parseInt(longitude) === 'number') {
                        async.waterfall([
                            callback => {
                                if ((user.role === 1 || user.role === 2) && admin_id) {
                                    sql = "SELECT `is_active`, `service_ids`, `role` FROM `admins` WHERE `id` = ?";
                                    connection.query(sql, [admin_id], (err, result) => {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            if (result && result[0]) {
                                                if (result[0].is_active === 1) {
                                                    if (result[0].service_ids.split(',').indexOf('1') === -1 || result[0].role !== 3) {
                                                        res.status(400).send({
                                                            message: 'not a valid admin'
                                                        })
                                                    } else {
                                                        callback(null)
                                                    }
                                                } else {
                                                    res.status(400).send({
                                                        message: 'admin has been deactivated'
                                                    })
                                                }
                                            } else {
                                                res.status(400).send({
                                                    message: 'admin not found'
                                                })
                                            }
                                        }
                                    })
                                } else {
                                    callback(null);
                                }
                            },
                            callback => {
                                sql = "SELECT `is_active` FROM `property_types` WHERE `id` = ?";
                                connection.query(sql, [property_type], (err, result) => {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        if (result && result[0]) {
                                            if (result[0].is_active === 1) {
                                                callback(null)
                                            } else {
                                                res.status(400).send({
                                                    message: 'property type has been deactivated'
                                                })
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'property type not found'
                                            })
                                        }
                                    }
                                })
                            },
                            callback => {
                                if (builder_id) {
                                    sql = "SELECT `is_active` FROM `builders` WHERE `id` = ?";
                                    connection.query(sql, [builder_id], (err, result) => {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            if (result && result[0]) {
                                                if (result[0].is_active === 1) {
                                                    callback(null)
                                                } else {
                                                    res.status(400).send({
                                                        message: 'builder has been deactivated'
                                                    })
                                                }
                                            } else {
                                                res.status(400).send({
                                                    message: 'builder not found'
                                                })
                                            }
                                        }
                                    })
                                } else {
                                    callback(null);
                                }
                            },

                            callback => {
                                sql = "SELECT `is_active`, `user_id`, `user_role` FROM `properties` WHERE `id` = ?";
                                connection.query(sql, [id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            if (result[0].user_role === 4) {
                                                if (user.role !== 4 || user.id !== result[0].user_id) {
                                                    res.status(403).send({
                                                        message: 'not authorized'
                                                    })
                                                } else {
                                                    if (result[0].is_active === 0) {
                                                        res.status(400).send({
                                                            message: 'property has been deactivated'
                                                        })
                                                    } else {
                                                        callback(null);
                                                    }
                                                }
                                            } else if (user.role === 3) {
                                                if (result[0].user_role === 3 || user.id === result[0].user_id) {
                                                    if (result[0].is_active === 0) {
                                                        res.status(400).send({
                                                            message: 'property has been deactivated'
                                                        })
                                                    } else {
                                                        callback(null);
                                                    }
                                                } else {
                                                    res.status(403).send({
                                                        message: 'not authorized'
                                                    })
                                                }
                                            } else {
                                                if (result[0].is_active === 0) {
                                                    res.status(400).send({
                                                        message: 'property has been deactivated'
                                                    })
                                                } else {
                                                    callback(null);
                                                }
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'property does not exist'
                                            })
                                        }
                                    }
                                })
                            },
                            callback => {

                                const updated_by = user.first_name + " " + user.last_name;
                                const updated_by_role = (user.role === 1 || user.role === 2) ? 'Super Admin' : ((user.role === 3 ? "Admin" : "Service Provider"))

                                let values = [];
                                if (user.role === 4) {
                                    sql = "UPDATE `properties` SET `name` = ?, `lattitude` = ?, `longitude` = ?, `location_url` = ?, `address` = ?, `city` = ?, `state` = ?, `country` = ?, `zipcode` =?, `price` = ?, `area` = ?, `bathrooms` = ?, `bedrooms` = ?, `property_type` = ?, `services_available` = ?, `units` = ?, `description` = ?, `builder_id` = ?, `contact_number` = ?, `contact_email` = ?, `thumbnail` = ?, `images` = ?, `updated_by` = ?, `updated_by_role` = ?, `updated_at` = NOW() WHERE `id` = ?";
                                    values = [name, lattitude, longitude, location_url, address, city, state, country, zipcode, price, area, bathrooms, bedrooms, property_type, services_available, units, description, builder_id, contact_number, contact_email, thumbnail, images, updated_by, updated_by_role, id];
                                } else {
                                    sql = "UPDATE `properties` SET `name` = ?, `lattitude` = ?, `longitude` = ?, `location_url` = ?, `address` = ?, `city` = ?, `state` = ?, `country` = ?, `zipcode` =?, `price` = ?, `area` = ?, `bathrooms` = ?, `bedrooms` = ?, `property_type` = ?, `services_available` = ?, `units` = ?, `description` = ?, `builder_id` = ?, `contact_number` = ?, `contact_email` = ?, `thumbnail` = ?, `images` = ?, `updated_by` = ?, `updated_by_role` = ?, `admin_id` = ?, `updated_at` = NOW() WHERE `id` = ?";

                                    values = [name, lattitude, longitude, location_url, address, city, state, country, zipcode, price, area, bathrooms, bedrooms, property_type, services_available, units, description, builder_id, contact_number, contact_email, thumbnail, images, updated_by, updated_by_role, admin_id, id];
                                }


                                connection.query(sql, values, (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        callback(null);
                                    }
                                })
                            }
                        ], (err) => {
                            if (err) {
                                res.status(400).send({
                                    message: 'some error occured'
                                })
                            } else {
                                res.status(200).send({
                                    message: 'property updated successfully'
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            message: 'inavalid location'
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'inavalid location'
                    })
                }

            } else {
                res.status(403).send({
                    message: 'not authorized'
                })
            }
        } else {
            res.status(400).send({
                message: 'Thumbnail is required'
            })
        }
    }
}

exports.fetchPropertyAddEditData = (req, res) => {
    const user = res.locals.user;
    if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) || user.role === 4) {
        let sql;
        async.parallel([
            callback => {
                sql = "SELECT `name`, `id` FROM `property_types` WHERE `is_active` = 1";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT `name`, `id` FROM `property_services` WHERE `is_active` = 1";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT `display_name`, `id` FROM `builders` WHERE `is_active` = 1";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                if (user.role === 1 || user.role === 2) {
                    sql = "SELECT `first_name`, `last_name`, `id` FROM `admins` WHERE `is_active` = 1 AND FIND_IN_SET('1', `service_ids`)";
                    connection.query(sql, [], (err, result) => {
                        callback(err, result)
                    })
                } else {
                    callback(null, []);
                }
            }
        ], (err, results) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occurred'
                })
            } else {
                if (user.role === 1 || user.role === 2) {
                    res.status(200).send({
                        message: "property add edit data fetched successfully",
                        data: {
                            property_types: results[0] || [],
                            property_services: results[1] || [],
                            builders: results[2] || [],
                            admins: results[3] || []
                        }
                    })
                } else {
                    res.status(200).send({
                        message: "property add edit data fetched successfully",
                        data: {
                            property_types: results[0] || [],
                            property_services: results[1] || [],
                            builders: results[2] || []
                        }
                    })

                }
            }
        })
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.fetchProperties = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) || user.role === 4) {
            const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1--> active, 2 --> not active, 3 --> approved, 4 --> not approved, 5 --> top properties 6 -> not assign to any admin
            const property_type = parseInt(req.body.property_type) || 0;
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";

            if (request_type === 6 && (user.role === 3 || user.role === 4)) {
                res.status(403).send({
                    message: 'not authorized'
                })
            } else {

                let sql, requestTypeQuery = 1, userQuery = 1, propertyTypeQuery = 1;
                const searchQuery = "p.`name` LIKE '" + search + "%'";

                if (request_type === 1) {
                    requestTypeQuery = "p.`is_active` = 1";
                } else if (request_type === 2) {
                    requestTypeQuery = "p.`is_active` = 0";
                } else if (request_type === 3) {
                    requestTypeQuery = "p.`is_approved` = 1";
                } else if (request_type === 4) {
                    requestTypeQuery = "p.`is_approved` = 0";
                } else if (request_type === 5) {
                    requestTypeQuery = "p.`is_top` = 1";
                } else if (request_type === 6) {
                    requestTypeQuery = "p.`admin_id` IS NULL";
                }

                if (property_type) {
                    propertyTypeQuery = "p.`property_type` = " + property_type;
                }

                if (user.role === 4) {
                    userQuery = "p.`user_id` = " + user.id + " AND p.`user_role` = 4";
                }

                if (user.role === 3) {
                    userQuery = "p.`admin_id` = " + user.id;
                }

                async.parallel([
                    callback => {

                        if (user.role === 1 || user.role === 2) {
                            sql = "SELECT p.`id`, p.`is_top`, p.`admin_id`, p.`name`, p.`location_url`, p.`address`, p.`city`, p.`state`, p.`country`, p.`zipcode`, p.`price`, p.`area`, p.`bathrooms`, p.`bedrooms`, p.`property_type`, p.`units`, p.`description`, p.`builder_id`, p.`contact_number`, p.`contact_email`, p.`thumbnail`,p.`images`, p.`services_available`, p.`user_role` AS `created_by_role`, p.`is_approved`, p.`is_active`, p.`updated_by`, p.`updated_by_role`, p.`created_at`, p.`updated_at`, COALESCE(CONCAT(sp.`first_name`, ' ', sp.`last_name`), '') AS `service_provider`, COALESCE(CONCAT(b.`first_name`, ' ', b.`last_name`), '') AS `builder_name`, COALESCE(CONCAT(ad.`first_name`, ' ', ad.`last_name`), '') AS `created_by`,COALESCE(CONCAT(ad1.`first_name`, ' ', ad1.`last_name`), '') AS `assigned_admin`,  COALESCE(pt.`name`, '') AS `property_type_name`, GROUP_CONCAT(ps.`name`) AS `services` FROM `properties` p LEFT JOIN `admins` ad ON p.`user_id` = ad.`id` AND p.`user_role` != 4 LEFT JOIN `admins` ad1 ON p.`admin_id` = ad1.`id` LEFT JOIN `service_providers` sp ON p.`user_id` = sp.`id` AND  p.`user_role` = 4 LEFT JOIN `builders` b ON b.`id` = p.`builder_id` LEFT JOIN `property_services` ps ON FIND_IN_SET(ps.`id`, p.`services_available`) LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` WHERE " + requestTypeQuery + " AND IF(p.`user_role` = 4, sp.`is_verified` = 1 AND sp.`is_active` = 1, '1') AND " + propertyTypeQuery + " AND " + searchQuery + " GROUP BY p.`id` ORDER BY p.`updated_at` DESC LIMIT " + offset + "," + limit;
                        } else {
                            sql = "SELECT p.`id`, p.`is_top`, p.`name`, p.`location_url`, p.`address`, p.`city`, p.`state`, p.`country`, p.`zipcode`, p.`price`, p.`area`, p.`bathrooms`, p.`bedrooms`, p.`property_type`, p.`units`, p.`description`, p.`builder_id`, p.`contact_number`, p.`contact_email`, p.`thumbnail`,p.`images`, p.`services_available`, p.`is_approved`, p.`is_active`, p.`created_at`, p.`updated_at`, COALESCE(CONCAT(b.`first_name`, ' ', b.`last_name`), '') AS `builder_name`, COALESCE(pt.`name`, '') AS `property_type_name`, GROUP_CONCAT(ps.`name`) AS `services` FROM `properties` p LEFT JOIN `builders` b ON b.`id` = p.`builder_id` LEFT JOIN `property_services` ps ON FIND_IN_SET(ps.`id`, p.`services_available`) LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` WHERE " + requestTypeQuery + " AND " + propertyTypeQuery + " AND " + userQuery + " AND " + searchQuery + " GROUP BY p.`id` ORDER BY p.`updated_at` DESC LIMIT " + offset + "," + limit;
                        }

                        connection.query(sql, [], (err, result) => {
                            callback(err, result)
                        })
                    },
                    callback => {
                        if (user.role === 1 || user.role === 2) {
                            sql = "SELECT COUNT(p.`id`) AS `total_properties` FROM `properties` p LEFT JOIN `service_providers` sp ON p.`user_id` = sp.`id` AND  p.`user_role` = 4 WHERE " + requestTypeQuery + " AND IF(p.`user_role` = 4, sp.`is_verified` = 1 AND sp.`is_active` = 1, '1') AND " + propertyTypeQuery + " AND " + searchQuery;
                        } else {
                            sql = "SELECT COUNT(p.`id`) AS `total_properties` FROM `properties` p WHERE " + requestTypeQuery + " AND " + propertyTypeQuery + " AND " + userQuery + " AND " + searchQuery;
                        }
                        connection.query(sql, [], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    callback(null, result[0].total_properties)
                                } else {
                                    callback(null, 0)
                                }
                            }
                        })
                    }
                ], (err, results) => {
                    if (err) {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        const data = []
                        if (results[0] && results[0].length > 0) {
                            results[0].map(item => {
                                data.push({
                                    ...item,
                                    created_at: getDateTimeInTimezone(item.created_at),
                                    updated_at: getDateTimeInTimezone(item.updated_at)
                                })
                            })
                        }
                        res.status(200).send({
                            message: 'properties fetched successfully',
                            data: {
                                properties: data,
                                total_properties: results[1] || 0
                            }
                        })
                    }
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.fetchPropertyById = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) && user.role === 4) {
            const id = req.params.id;
            async.waterfall([
                callback => {
                    sql = "SELECT p.`id`, p.`is_top`, p.`name`, p.`location_url`, p.`lattitude`, p.`longitude`,  p.`address`, p.`city`, p.`state`, p.`country`, p.`zipcode`, p.`price`, p.`area`, p.`bathrooms`, p.`bedrooms`, p.`property_type`, p.`units`, p.`description`, p.`builder_id`, p.`contact_number`, p.`contact_email`, p.`thumbnail`, p.`images`, p.`is_approved`, p.`is_active`, p.`created_at`, p.`updated_at`, COALESCE(CONCAT(b.`first_name`, ' ', b.`last_name`), '') AS `builder_name`, COALESCE(pt.`name`, '') AS `property_type_name`, GROUP_CONCAT(ps.`name`) AS `services` FROM `properties` p LEFT JOIN `builders` b ON b.`id` = p.`builder_id` LEFT JOIN `property_services` ps ON FIND_IN_SET(ps.`id`, p.`services_available`) LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` WHERE p.`id` = ? GROUP BY p.`id`";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0]);
                            } else {
                                callback(null, null)
                            }
                        }
                    })
                }
            ], (err, result) => {
                if (err) {
                    res.status(400).send({
                        message: 'some error occurred'
                    })
                } else {
                    res.status(200).send({
                        message: 'property details fetched successfully',
                        data: result || {}
                    })
                }
            })
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.activateDeactivateProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) || user.role === 4) {
            const id = req.params.id;
            const request_type = parseInt(req.body.request_type);
            if (request_type === 0 || request_type === 1) {
                let sql;
                async.waterfall([
                    callback => {
                        sql = "SELECT `user_role`, `user_id`, `is_active` FROM `properties` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (user.role === 3 || user.role === 4) {
                                        if (user.id === result[0].user_id && user.role === result[0].user_role) {
                                            if (request_type === result[0].is_active) {
                                                res.status(400).send({
                                                    message: (request_type === 0 ? 'property has already been deactivated' : 'property has already been activated')
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            res.status(403).send({
                                                message: 'not authorized'
                                            })
                                        }
                                    } else {
                                        if (result[0].user_role !== 4) {
                                            if (request_type === result[0].is_active) {
                                                res.status(400).send({
                                                    message: (request_type === 0 ? 'property has already been deactivated' : 'property has already been activated')
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            res.status(403).send({
                                                message: 'not authorized'
                                            })
                                        }
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'property does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        const updated_by = user.first_name + " " + user.last_name;
                        const updated_by_role = (user.role === 1 || user.role === 2) ? 'Super Admin' : ((user.role === 3 ? "Admin" : "Service Provider"))
                        sql = "UPDATE `properties` SET `is_active` = ?, `updated_by` = ?, `updated_by_role` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, updated_by, updated_by_role, id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
                            }
                        })
                    }
                ], (err) => {
                    if (err) {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type === 0 ? 'property has been deactivated' : 'property has been activated')
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid request'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.propertyApproval = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 1 || user.role === 2) {
            const id = req.params.id;
            const request_type = parseInt(req.body.request_type);
            if (request_type === 0 || request_type === 1) {
                let sql;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_approved` FROM `properties` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (request_type === result[0].is_active) {
                                        res.status(400).send({
                                            message: (request_type === 0 ? 'property has already been disapproved' : 'property has already been approved')
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'property does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        const updated_by = user.first_name + " " + user.last_name;
                        const updated_by_role = (user.role === 1 || user.role === 2) ? 'Super Admin' : ((user.role === 3 ? "Admin" : "Service Provider"))
                        sql = "UPDATE `properties` SET `is_approved` = ?, `updated_by` = ?, `updated_by_role` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, updated_by, updated_by_role, id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
                            }
                        })
                    }
                ], (err) => {
                    if (err) {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type === 0 ? 'property has been disapproved' : 'property has been approved')
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid request'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.setTopProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 1 || user.role === 2) {
            const id = req.params.id;
            const request_type = parseInt(req.body.request_type);
            if (request_type === 0 || request_type === 1) {
                let sql;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_top`, `is_active`,`is_approved` FROM `properties` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === 0) {
                                        res.status(400).send({
                                            message: 'property has been deactivated'
                                        })
                                    } else {
                                        if (result[0].is_approved === 1) {
                                            if (result[0].is_top === request_type) {
                                                res.status(400).send({
                                                    message: (request_type === 0 ? 'property is already not a top property' : 'property is already a top property')
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'property has not been approved'
                                            })
                                        }
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'property does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        const updated_by = user.first_name + " " + user.last_name;
                        const updated_by_role = (user.role === 1 || user.role === 2) ? 'Super Admin' : ((user.role === 3 ? "Admin" : "Service Provider"))
                        sql = "UPDATE `properties` SET `is_top` = ?, `updated_by` = ?, `updated_by_role`= ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, updated_by, updated_by_role, id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
                            }
                        })
                    }
                ], (err) => {
                    if (err) {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type === 0 ? 'property has been removed as a top property' : 'property is now a top property')
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid request'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.fetchPropertiesSearchData = (req, res) => {
    let sql;
    async.parallel([
        callback => {
            sql = "SELECT `city` FROM `properties` WHERE `is_approved` = 1 AND `is_active` = 1 GROUP BY `city` ORDER BY `city`";
            connection.query(sql, [], (err, result) => {
                callback(err, result)
            })
        },
        callback => {
            sql = "SELECT `state` FROM `properties` WHERE `is_approved` = 1 AND `is_active` = 1 GROUP BY `state` ORDER BY `state`";
            connection.query(sql, [], (err, result) => {
                callback(err, result)
            })
        },
        callback => {
            sql = "SELECT `country` FROM `properties` WHERE `is_approved` = 1 AND `is_active` = 1 GROUP BY `country` ORDER BY `country`";
            connection.query(sql, [], (err, result) => {
                callback(err, result)
            })
        }
    ], (err, results) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            const data = [];
            if (results[0]) {
                results[0].forEach(item => {
                    data.push(item.city)
                })
            }
            if (results[1]) {
                results[1].forEach(item => {
                    data.push(item.state)
                })
            }
            if (results[2]) {
                results[2].forEach(item => {
                    data.push(item.country)
                })
            }
            data.sort();
            res.status(200).send({
                message: 'properties search data fetched successfully',
                data: data
            })
        }
    })
}

exports.viewedProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const id = req.params.id;

        async.waterfall([
            callback => {
                let sql = "UPDATE `properties` SET `views` = `views` + 1, `updated_at` = NOW() WHERE `id` = ?";
                connection.query(sql, [id], (err, result) => {
                    callback(null)
                })
            }
        ], (err) => {
            res.status(200).send({
                message: 'successfully icreased property views'
            })
        })
    }
}

exports.showProperties = (req, res) => {
    const property_types = req.body.property_types || "";
    const is_top = parseInt(req.body.is_top) || 0;
    const filters = req.body.filters || "";
    const search = req.body.search || ""; // 1 --> most popular, 2 --> most viewed, 3 --> latest, 4 --> oldest, 5 --> highest price,6 --> lowest price
    const sort = parseInt(req.body.sort) || 0;
    const limit = parseInt(req.body.limit) || 10;
    const offset = parseInt(req.body.offset) || 0;

    let sql, filterQuery = 1, topPropertyQuery = 1, propertyTypeQuery = 1, sortQuery, searchQuery = 1;
    if (search) {
        searchQuery = "(FIND_IN_SET(p.`city`, '" + search + "') OR FIND_IN_SET(p.`state`, '" + search + "') OR FIND_IN_SET(p.`country`,'" + search + "'))";
    }
    if (is_top === 1) {
        topPropertyQuery = "p.`is_top` = 1"
    }

    if (sort === 1) {
        sortQuery = " ORDER BY p.`enquiries` DESC, p.`updated_at` DESC "
    } else if (sort === 2) {
        sortQuery = " ORDER BY p.`views` DESC, p.`updated_at` DESC "
    } else if (sort === 4) {
        sortQuery = " ORDER BY p.`updated_at` ASC "
    } else if (sort === 5) {
        sortQuery = " ORDER BY p.`price` DESC, p.`updated_at` DESC "
    } else if (sort === 6) {
        sortQuery = " ORDER BY p.`price` ASC, p.`updated_at` DESC "
    } else {
        sortQuery = " ORDER BY p.`updated_at` DESC "
    }

    if (property_types) {
        propertyTypeQuery = "p.`property_type` IN ('" + property_types + "')"
    }

    async.waterfall([
        callback => {
            sql = "SELECT f.`type`, f.`max_value`, f.`value`, f.`min_value`, fc.`field_name` FROM `filters` f LEFT JOIN `filter_categories` fc ON fc.`id` = f.`category_id` WHERE f.`is_active` = 1 AND FIND_IN_SET(f.`id`,'" + filters + "')";
            connection.query(sql, [], (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    if (result && result.length > 0) {
                        const data = [];
                        for (let i = 0; i < result.length; i++) {
                            const temp = [];
                            for (let j = 0; j < result.length; j++) {
                                if (result[i]["field_name"] === result[j]["field_name"]) {
                                    temp.push(result[j]);
                                } else {
                                    break;
                                }
                            }
                            data.push(temp);
                            i = i + temp.length;
                        }
                        const filtersArray = []
                        data.forEach(filterArray => {
                            let tempArr = [];
                            filterArray.forEach(filter => {
                                if (filter.type === 1) {
                                    tempArr.push("p.`" + filter['field_name'] + "` >= " + filter['min_value'] + " AND p.`" + filter['field_name'] + "` <= " + filter['max_value'])
                                } else if (filter.type === 2) {
                                    tempArr.push("p.`" + filter['field_name'] + "` = " + filter['value'])
                                } else if (filter.type === 3) {
                                    tempArr.push("p.`" + filter['field_name'] + "` <= " + filter['max_value'])
                                } else if (filter.type === 4) {
                                    tempArr.push("p.`" + filter['field_name'] + "` >= " + filter['min_value'])
                                } else {
                                    tempArr.push(1);
                                }
                            })
                            filtersArray.push(`(${tempArr.join(" OR ")})`);
                            tempArr = []
                        })
                        filterQuery = filtersArray.join(" AND ");
                        callback(null)
                    } else {
                        callback(null)
                    }
                }
            })
        },
        callback => {
            async.parallel([
                cb => {
                    sql = "SELECT p.`id`, p.`name`, p.`location_url`, p.`lattitude`, p.`longitude`, p.`city`, p.`state`, p.`description`, p.`thumbnail`, COALESCE(pt.`name`, '') AS `property_type` FROM `properties` p LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` LEFT JOIN `service_providers` sp ON sp.`id` = p.`user_id` AND p.`user_role` = 4 WHERE p.`is_active` = 1 AND p.`is_approved` = 1 AND pt.`is_active` = 1 AND IF(p.`user_role` = 4, sp.`is_verified` = 1 AND sp.`is_active` = 1, 1) AND " + filterQuery + " AND " + searchQuery + " AND " + propertyTypeQuery + " AND " + topPropertyQuery + sortQuery + "LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        cb(err, result)
                    })
                },
                cb => {
                    sql = "SELECT COUNT(p.`id`) AS `total_properties` FROM `properties` p LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` LEFT JOIN `service_providers` sp ON sp.`id` = p.`user_id` AND p.`user_role` = 4 WHERE p.`is_active` = 1 AND p.`is_approved` = 1 AND pt.`is_active` = 1 AND IF(p.`user_role` = 4, sp.`is_verified` = 1 AND sp.`is_active` = 1, 1) AND " + filterQuery + " AND " + searchQuery + " AND " + propertyTypeQuery + " AND " + topPropertyQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            cb(err, null)
                        } else {
                            if (result && result[0]) {
                                cb(null, result[0].total_properties)
                            } else {
                                cb(null, 0)
                            }
                        }
                    })
                }
            ], (err, results) => {
                callback(err, results)
            })
        }
    ], (err, results) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            res.status(200).send({
                message: 'properties fetched successfully',
                data: {
                    properties: results[0] || [],
                    total_properties: results[1] || 0
                }
            })
        }
    })
}

exports.showTopProperties = (req, res) => {
    async.waterfall([
        callback => {
            let sql = "SELECT p.`id`, p.`name`, p.`city`, p.`state`, p.`thumbnail` FROM `properties` p LEFT JOIN `property_types` pt ON p.`property_type` = pt.`id` LEFT JOIN `service_providers` sp ON sp.`id` = p.`user_id` AND p.`user_role` = 4 WHERE p.`is_active` = 1 AND p.`is_approved` = 1 AND pt.`is_active` = 1 AND IF(p.`user_role` = 4, sp.`is_verified` = 1 AND sp.`is_active` = 1, 1) ORDER BY p.`is_top`, p.`updated_at` LIMIT 4";
            connection.query(sql, [], (err, result) => {
                callback(err, result);
            })
        }
    ], (err, result) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            res.status(200).send({
                message: 'properties fetched successfully',
                data: result || []
            })
        }
    })
}

exports.showProperty = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const id = parseInt(req.params.id) || 0;
        async.waterfall([
            callback => {
                let sql = "SELECT p.`id`, p.`name`, p.`description`, p.`location_url`, p.`lattitude`, p.`longitude`, p.`price`, p.`city`, p.`state`, p.`thumbnail`, p.`images`, GROUP_CONCAT(ps.`icon`) AS `services` FROM `properties` p LEFT JOIN `property_services` ps ON FIND_IN_SET(ps.`id`, p.`services_available`) WHERE p.`is_active` = 1 AND p.`is_approved` = 1 AND p.`id` = ? GROUP BY p.`id`";
                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0])
                        } else {
                            res.status(400).send({
                                message: 'property does not exist'
                            })
                        }
                    }
                })
            }
        ], (err, result) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occurred'
                })
            } else {
                res.status(200).send({
                    message: 'property details fetched successfully',
                    data: result
                })
            }
        })
    }
}