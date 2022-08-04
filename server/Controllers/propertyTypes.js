const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

exports.addPropertyType = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const { role } = res.locals.user;
        if (role === 1 || role === 2) {
            const name = req.body.name;

            async.waterfall([
                callback => {
                    let sql = "INSERT INTO `property_types` (`name`, `created_at`, `updated_at`) VALUES (?,NOW(),NOW())";
                    connection.query(sql, [name], (err, result) => {
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
                            message: 'property type already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "property type created successfully"
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

exports.editPropertyType = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const { role } = res.locals.user;
        if (role === 1 || role === 2) {
            const id = req.params.id
            const name = req.body.name;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `property_types` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_active === 1) {
                                    callback(null)
                                } else {
                                    res.status(403).send({
                                        message: "property type has been deactivated"
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
                    sql = "UPDATE `property_types` SET `name` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [name, id], (err, result) => {
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
                            message: 'property type already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "property service updated successfully"
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

exports.activateDeactivatePropertyType = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const { role } = res.locals.user;
        if (role === 1 || role === 2) {
            const request_type = parseInt(req.body.request_type)
            if (request_type === 1 || request_type === 0) {
                const id = req.params.id
                let sql;

                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `property_types` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active !== request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type === 1 ? "property type has already been activated" : "property type has already been deactivated")
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
                        sql = "UPDATE `property_types` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, id], (err, result) => {
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
                            message: (request_type === 1 ? "property type activated successfully" : "property type deactivated successfully")
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: "invalid request"
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.fetchPropertyTypes = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const { role } = res.locals.user;
        if (role === 1 || role === 2) {
            const request_type = parseInt(req.body.request_type) || 0 // 0 --> all, 1 --> active, 2 --> not active
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";
            let sql, requestTypeQuery;
            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            async.parallel([
                callback => {
                    sql = "SELECT `id`, `name`, `is_active`, `created_at`, `updated_at` FROM `property_types` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%' ORDER BY `updated_at` DESC LIMIT " + offset + ',' + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result);
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_property_types` FROM `property_types` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%'";
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_property_types)
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
                        message: 'property types list fetched successfully',
                        data: {
                            property_types: data,
                            total_property_types: results[1] || 0
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

exports.fetchActivePropertyTypes = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const { role, service_id } = res.locals.user;
        if (role === 1 || role === 2 || role == 4 || (role === 3 && service_id === 1)) {
            async.waterfall([
                callback => {
                    sql = "SELECT `id`, `name` FROM `property_types` WHERE `is_active` = 1";
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
                        message: 'property types list fetched successfully',
                        data: result
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