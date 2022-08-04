const jwt = require('jsonwebtoken');
const async = require('async');
const connection = require('../db/database');

exports.checkUserSession = (req, res, next) => {
    const token = req.headers.authorization;
    let sql;

    if (token) {
        async.waterfall([
            callback => {
                jwt.verify(token, '12345678', (err, data) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (data && data.data) {
                            callback(null, data.data)
                        } else {
                            res.status(401).send({
                                message: 'session expired'
                            })
                        }
                    }
                })
            },
            (user, callback) => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [user.id, user.role, token], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0] && result[0].tokens) {
                            if (result[0].tokens.split(',').indexOf(token) !== -1) {
                                callback(null, user)
                            } else {
                                res.status(401).send({
                                    message: 'session expired'
                                })
                            }
                        } else {
                            res.status(401).send({
                                message: 'session expired'
                            })
                        }
                    }
                })
            },
            (user, callback) => {
                if (user.role === 1 || user.role === 2 || user.role === 3) {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `role`, `service_ids`, `is_active` FROM `admins` WHERE `id` = ?";
                } else if (user.role === 4) {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `role`, `is_active`, `is_verified` FROM `service_providers` WHERE `id` = ?";
                } else if (user.role === 5) {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `role`, `is_active`, `is_verified` FROM `users` WHERE `id` = ?";
                }
                connection.query(sql, [user.id], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result.length > 0) {
                            if (user.role === 1) {
                                callback(null, result[0])
                            } else {
                                if (result[0].is_active === 1) {
                                    if (result[0].role === 4 && result[0].is_verified === 0) {
                                        res.status(401).send({
                                            message: (result[0].is_verified === 0 ? "your account is not verified. Please verify your account" : "your account is not approved")
                                        })
                                    } else if (result[0].role === 5 && result[0].is_verified === 0) {
                                        res.status(401).send({
                                            message: "your account has not been verified. please verify your account"
                                        })
                                    } else {
                                        callback(null, result[0])
                                    }
                                } else {
                                    res.status(401).send({
                                        message: 'your account has been deactivated'
                                    })
                                }
                            }
                        } else {
                            res.status(401).send({
                                message: 'session expired'
                            })
                        }
                    }
                })
            }
        ], (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    res.status(401).send({
                        message: 'session expired'
                    })
                } else {
                    res.status(400).send({
                        message: 'some error occurred'
                    })
                }
            } else {
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.status(400).send({
            message: 'invalid token'
        })
    }
}