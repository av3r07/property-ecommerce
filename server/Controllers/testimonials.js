const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

exports.addTestimonial = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        if (req.file) {
            const { role } = res.locals.user;
            if (role === 1 || role === 2) {
                const name = req.body.name;
                const image = req.file.filename;
                const comment = req.body.comment;


                async.waterfall([
                    callback => {
                        let sql = "INSERT INTO `testimonials` (`name`,`comment`, `image`, `created_at`, `updated_at`) VALUES (?,?,?,NOW(),NOW())";
                        connection.query(sql, [name, comment, image], (err, result) => {
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
                                message: 'testimonial already exists'
                            })
                        } else {
                            res.status(400).send({
                                message: 'some error occured'
                            })
                        }
                    } else {
                        res.status(200).send({
                            message: "testimonial added successfully"
                        })
                    }
                })

            } else {
                res.status(403).send({
                    message: 'not authorized'
                })
            }
        } else {
            res.status(400).send({
                message: 'image is required'
            })
        }
    }
}

exports.editTestimonial = (req, res) => {
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
            const comment = req.body.comment;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `testimonials` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_active === 1) {
                                    callback(null)
                                } else {
                                    res.status(403).send({
                                        message: "testimonial has been deactivated"
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: 'testimonial not found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    let values = [];
                    if (req.file) {
                        sql = "UPDATE `testimonials` SET `name` = ?, `comment` = ?, `image` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        values = [name, comment, req.file.filename, id];
                    } else {
                        sql = "UPDATE `testimonials` SET `name` = ?, `comment` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        values = [name, comment, id];
                    }
                    connection.query(sql, values, (err, result) => {
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
                            message: 'testimonial already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "testimonial updated successfully"
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

exports.activateDeactivateTestimonial = (req, res) => {
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
                        sql = "SELECT `is_active` FROM `testimonials` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active !== request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type === 1 ? "testimonial has already been activated" : "testimonial has already been deactivated")
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'testimonial not found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `testimonials` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 1 ? "testimonial activated successfully" : "testimonial deactivated successfully")
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

exports.fetchTestimonials = (req, res) => {
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
                    sql = "SELECT `id`, `name`,`comment`, `image`, `is_active`, `created_at`, `updated_at` FROM `testimonials` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%' ORDER BY `updated_at` LIMIT " + offset + ',' + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result);
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_testimonials` FROM `testimonials` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%'";
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_testimonials)
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
                        message: 'testimonials list fetched successfully',
                        data: {
                            testimonials: data,
                            total_testimonials: results[1] || 0
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

exports.showTestimonials = (req, res) => {
    async.waterfall([
        callback => {
            const sql = "SELECT `id`, `comment`, `name`, `image` FROM `testimonials` WHERE `is_active` = 1 ORDER BY `updated_at`";
            connection.query(sql, [], (err, result) => {
                callback(err, result)
            })
        }
    ], (err, result) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            res.status(200).send({
                message: 'testimonials fetched successfully',
                data: result || []
            })
        }
    })
}