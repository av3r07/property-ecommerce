const async = require('async');
const fs = require('fs');
const { validationResult } = require('express-validator');
const connection = require('../db/database');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

exports.addBuilder = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const {
                display_name,
                first_name,
                last_name,
                email,
                phone,
                address,
                city,
                state,
                country,
                zipcode,
            } = req.body;
            let image = "";
            if (req.file) {
                image = req.file.filename
            }
            async.waterfall([
                callback => {
                    let sql = "INSERT INTO `builders` (`display_name`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `state`, `country`, `zipcode`, `image`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(), NOW())";
                    connection.query(sql, [display_name, first_name, last_name, email, phone, address, city, state, country, zipcode, image], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null)
                        }
                    })
                }
            ], (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).send({
                            message: 'builder already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'builder added successfully'
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

exports.editBuilder = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const id = req.params.id;
            const {
                display_name,
                first_name,
                last_name,
                email,
                phone,
                address,
                city,
                state,
                country,
                zipcode,
            } = req.body;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `builders` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_active === 0) {
                                    res.status(403).send({
                                        message: 'builder has been deactivated'
                                    })
                                } else {
                                    callback(null)
                                }
                            } else {
                                res.status(400).send({
                                    message: 'builder not found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    let image = "";
                    if (typeof req.body.image === 'string') {
                        image = req.body.image;
                    }
                    if (req.file) {
                        image = req.file.filename;
                    }
                    sql = "UPDATE `builders` SET `display_name` = ?, `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `address` = ?, `city` = ?, `state` = ?, `country` = ?, `zipcode` = ?, `image` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [display_name, first_name, last_name, email, phone, address, city, state, country, zipcode, image, id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null)
                        }
                    })
                }
            ], (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).send({
                            message: 'builder already exists with same email or phone number'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'builder updated successfully'
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

exports.activateDeactivateBuilder = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const request_type = parseInt(req.body.request_type);
            if (request_type === 0 || request_type === 1) {
                let sql;
                const id = req.params.id;

                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `builders` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (request_type === result[0].is_active) {
                                        res.status(400).send({
                                            message: (request_type === 1 ? "builder has already been activated" : "builder has already been deactivated")
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'builder not found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `builders` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
                            }
                        })
                    },
                    callback => {
                        if (request_type === 0) {
                            sql = "UPDATE `properties` SET `builder_id` = ? WHERE `builder_id` = ?";
                            connection.query(sql, [null, id], (err, result) => {
                                callback(null)
                            })
                        } else {
                            callback(null)
                        }
                    }
                ], (err) => {
                    if (err) {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type === 1 ? "builder activated successfully" : "builder deactivated successfully")
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid request type'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}


exports.fetchBuilders = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1 --> active, 2 --> not active
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";

            let sql, requestTypeQuery;
            const searchQuery = "(`display_name` LIKE '" + search + "%' OR `first_name` LIKE '" + search + "%' OR  `last_name` LIKE '" + search + "%' OR `email` LIKE '" + search + "%')";
            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            async.parallel([
                callback => {
                    sql = "SELECT `id`,`display_name`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `state`, `country`, `zipcode`, `image`, `is_active`, `created_at`, `updated_at` FROM `builders` WHERE " + requestTypeQuery + " AND " + searchQuery + " ORDER BY `updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_builders` FROM `builders` WHERE " + requestTypeQuery + " AND " + searchQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0] && result[0].total_builders) {
                                callback(null, result[0].total_builders)
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
                        message: 'builders list fetched successfully',
                        data: {
                            builders: data,
                            total_builders: results[1] || 0
                        }
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

