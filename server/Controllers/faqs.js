const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

exports.addFaq = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const service_id = parseInt(req.body.service_id) || 0;
        if (service_id === 1 || service_id === 2 || service_id === 3) {
            const { role } = res.locals.user;
            if (role === 1 || role === 2) {
                const question = req.body.question;
                const answer = req.body.answer;
                let sql;
                let plan_id = null;
                if (service_id === 2) {
                    if (parseInt(req.body.plan_id)) {
                        plan_id = req.body.plan_id;
                    }
                }


                async.waterfall([
                    callback => {
                        if (service_id === 2 && plan_id) {
                            sql = "SELECT fp.`is_active` AS `plan_status`, fpc.`is_active` AS `category_status` FROM `financial_plans` fp LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE fp.`id` = ?";
                            connection.query(sql, [plan_id], (err, result) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    if (result && result[0]) {
                                        if (result[0].category_status === 0) {
                                            res.status(400).send({
                                                message: 'financial plans category has been deactivated'
                                            })
                                        } else {
                                            if (result[0].plan_status === 0) {
                                                res.status(400).send({
                                                    message: 'financial plan has been deactivated'
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        }
                                    } else {
                                        res.status(400).send({
                                            message: 'plan not found'
                                        })
                                    }
                                }
                            })

                        } else {
                            callback(null)
                        }
                    },
                    callback => {
                        sql = "INSERT INTO `faqs` (`question`,`answer`, `service_id`, `plan_id`, `created_at`, `updated_at`) VALUES (?,?,?,?,NOW(),NOW())";
                        connection.query(sql, [question, answer, service_id, plan_id], (err, result) => {
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
                                message: 'faq already exists'
                            })
                        } else {
                            res.status(400).send({
                                message: 'some error occured'
                            })
                        }
                    } else {
                        res.status(200).send({
                            message: "faq added successfully"
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
                message: 'not a valid service'
            })
        }
    }
}

exports.editFaq = (req, res) => {
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
            const question = req.body.question;
            const answer = req.body.answer;
            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `faqs` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_active === 1) {
                                    callback(null)
                                } else {
                                    res.status(403).send({
                                        message: "faq has been deactivated"
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: 'faq not found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    sql = "UPDATE `faqs` SET `question` = ?, `answer` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [question, answer, id], (err, result) => {
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
                            message: 'faq already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "faq updated successfully"
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

exports.activateDeactivateFaq = (req, res) => {
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
                        sql = "SELECT `is_active` FROM `faqs` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active !== request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type === 1 ? "faq has already been activated" : "faq has already been deactivated")
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'faq not found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `faqs` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 1 ? "faq activated successfully" : "faq deactivated successfully")
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

exports.fetchFaqs = (req, res) => {
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
            const service_id = parseInt(req.body.service_id) || 0;
            const search = req.body.search || "";
            let sql, requestTypeQuery, serviceQuery = 1;
            if (request_type === 1) {
                requestTypeQuery = "f.`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "f.`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            if (service_id) {
                serviceQuery = "f.`service_id` = " + service_id;
            }

            async.parallel([
                callback => {
                    sql = "SELECT f.`id`, f.`question`,`answer`, f.`service_id`, f.`is_active`, f.`created_at`, f.`updated_at`, f.`plan_id`, COALESCE(fp.`name`, '') AS `plan`, fpc.`id` AS `category_id` FROM `faqs` f LEFT JOIN `financial_plans` fp ON f.`plan_id` = fp.`id` LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE " + requestTypeQuery + " AND " + serviceQuery + " AND f.`question` LIKE '" + search + "%' ORDER BY f.`updated_at` LIMIT " + offset + ',' + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result);
                    })
                },
                callback => {
                    sql = "SELECT COUNT(f.`id`) AS `total_faqs` FROM `faqs` f WHERE " + requestTypeQuery + " AND " + serviceQuery + " AND `question` LIKE '" + search + "%'";
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_faqs)
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
                        message: 'faqs list fetched successfully',
                        data: {
                            faqs: data,
                            total_faqs: results[1] || 0
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

exports.showFaqs = (req, res) => {
    const id = parseInt(req.params.id) || 0;
    const limit = parseInt(req.body.limit) || 0;
    let sql;
    async.waterfall([
        callback => {
            if (limit === 3) {
                sql = "SELECT `id`, `question`, `answer` FROM `faqs` WHERE `is_active` = 1 AND `service_id` = ? AND `plan_id` IS NULL ORDER BY `updated_at` LIMIT 3";
            } else {
                sql = "SELECT `id`, `question`, `answer` FROM `faqs` WHERE `is_active` = 1 AND `service_id` = ? AND `plan_id` IS NULL ORDER BY `updated_at`";
            }
            connection.query(sql, [id], (err, result) => {
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
                message: 'faqs fetched successfully',
                data: result
            })
        }
    })
}

exports.showFinancialPlanFaqs = (req, res) => {
    const id = parseInt(req.params.id) || 0;
    const limit = parseInt(req.body.limit) || 0;
    let sql;
    async.waterfall([
        callback => {
            if (limit === 3) {
                sql = "SELECT `id`, `question`, `answer` FROM `faqs` WHERE `is_active` = 1 AND `service_id` = 2  AND `plan_id` = ? ORDER BY `updated_at` LIMIT 3";
            } else {
                sql = "SELECT `id`, `question`, `answer` FROM `faqs` WHERE `is_active` = 1 AND `service_id` = 2  AND `plan_id` = ? ORDER BY `updated_at`";
            }
            connection.query(sql, [id], (err, result) => {
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
                message: 'faqs fetched successfully',
                data: result
            })
        }
    })
}