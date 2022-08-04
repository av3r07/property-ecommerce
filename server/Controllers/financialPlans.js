const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

exports.addFinancialPlansCategory = (req, res) => {
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
                name
            } = req.body;

            async.waterfall([
                callback => {
                    let sql = "INSERT INTO `financial_plans_categories` (`name`, `created_at`, `updated_at`) VALUES (?,NOW(),NOW())";
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
                            message: 'financial plans category already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'financial plans category added successfully'
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

exports.editFinancialPlansCategory = (req, res) => {
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
                name
            } = req.body;
            const id = req.params.id;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `financial_plans_categories` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                if (result[0].is_active === 0) {
                                    res.status(400).send({
                                        message: 'financial plans category has been deactivated'
                                    })
                                } else {
                                    callback(null)
                                }
                            } else {
                                res.status(400).send({
                                    message: 'financial plans category does not exist'
                                })
                            }
                        }
                    })
                },
                callback => {
                    let sql = "UPDATE `financial_plans_categories` SET `name` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: 'financial plans categories already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'financial plans categories updated successfully'
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

exports.activateDeactivateFinancialPlansCategory = (req, res) => {
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
                const id = req.params.id;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_categories` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === request_type) {
                                        res.status(400).send({
                                            message: (request_type === 0 ? 'financial plans category has already been deactivated' : 'financial plans category has already been activated')
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plans category does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        let sql = "UPDATE `financial_plans_categories` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 0 ? 'financial plans category deactivated successfully' : 'financial plans category activated successfully')
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

exports.fetchFinancialPlansCategories = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        const search = req.body.search || "";
        const request_type = parseInt(req.body.request_type) || 0 // 0 --> all, 1 --> active, 2 --> not active
        const offset = parseInt(req.body.offset) || 0;
        const limit = parseInt(req.body.limit) || 10;
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
                sql = "SELECT `id`, `name`, `is_active`, `created_at`, `updated_at` FROM `financial_plans_categories` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%' ORDER BY `updated_at` LIMIT " + offset + ',' + limit;
                connection.query(sql, [], (err, result) => {
                    callback(err, result);
                })
            },
            callback => {
                sql = "SELECT COUNT(`id`) AS `total_financial_plans_categories` FROM `financial_plans_categories` WHERE " + requestTypeQuery + " AND `name` LIKE '" + search + "%'";
                connection.query(sql, [], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0].total_financial_plans_categories)
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
                    message: 'financial plans categories list fetched successfully',
                    data: {
                        financial_plans_categories: data,
                        total_financial_plans_categories: results[1] || 0
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

exports.fetchFinancialPlansAddEditData = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        async.waterfall([
            callback => {
                let sql = "SELECT `id`, `name` FROM `financial_plans_categories` WHERE `is_active` = 1";
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
                    message: 'financial plans add edit data fetched successfully',
                    data: {
                        financial_plans_categories: result || []
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


exports.addFinancialPlan = (req, res) => {
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
                name,
                description,
                benefits,
                docs
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const category_id = parseInt(req.body.category_id) || null;

            if (price > 0) {
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_categories` WHERE `id` = ?";
                        connection.query(sql, [category_id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === 1) {
                                        callback(null)
                                    } else {
                                        res.status(400).send({
                                            message: 'financial plans category has been deactivated'
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plans category does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        let sql = "INSERT INTO `financial_plans` (`name`, `description`, `benefits`, `price`, `category_id`, `docs`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,NOW(),NOW())";
                        connection.query(sql, [name, description, benefits, price, category_id, docs], (err, result) => {
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
                            message: 'financial plan added successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.editFinancialPlan = (req, res) => {
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
                name,
                description,
                benefits,
                docs
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const category_id = parseInt(req.body.category_id) || null;

            const id = req.params.id;

            let sql;

            if (price > 0) {
                async.waterfall([
                    callback => {
                        sql = "SELECT fp.`is_active` AS `plan_status`, fpc.`is_active` AS `category_status` FROM `financial_plans` fp LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE fp.`id` = ?";
                        connection.query(sql, [id], (err, result) => {
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
                    },
                    callback => {
                        sql = "UPDATE `financial_plans` SET `name` = ?, `description` = ?, `benefits` = ?, `price` = ?, `category_id` = ?, `docs` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        values = [name, description, benefits, price, category_id, docs, id];
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
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    } else {
                        res.status(200).send({
                            message: 'financial plan updated successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}


exports.activateDeactivateFinancialPlan = (req, res) => {
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
                const id = req.params.id;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === request_type) {
                                        res.status(400).send({
                                            message: (request_type === 0 ? 'financial plan has already been deactivated' : 'financial plan has already been activated')
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plan does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        let sql = "UPDATE `financial_plans` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 0 ? 'financial plan deactivated successfully' : 'financial plan activated successfully')
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

exports.fetchFinancialPlans = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1--> active, 2 --> not active
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const category_id = parseInt(req.body.category_id) || 0;
            const search = req.body.search || "";
            let sql, requestTypeQuery, categoryQuery;
            const searchQuery = "fp.`name` LIKE '" + search + "%'";

            if (category_id && category_id !== 0) {
                categoryQuery = "fp.`category_id` = " + category_id;
            } else {
                categoryQuery = "1";
            }
            if (request_type === 1) {
                requestTypeQuery = "fp.`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "fp.`is_active` = 0";
            } else {
                requestTypeQuery = "1";
            }

            async.parallel([
                callback => {
                    sql = "SELECT fp.`id`, fp.`name`, fp.`description`, fp.`docs`, fp.`benefits`, fp.`price`, fp.`category_id`, fp.`is_active`, fp.`created_at`, fp.`updated_at`, fpc.`name` AS `category` FROM `financial_plans` fp LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + categoryQuery + " ORDER BY fp.`updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_financial_plans` FROM `financial_plans` fp WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + categoryQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_financial_plans)
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
                        message: 'financial plans list fetched successfully',
                        data: {
                            financial_plans: data,
                            total_financial_plans: results[1] || 0
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

exports.fetchFinancialPlansAddonsAddEditData = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        const category_id = req.body.category_id;
        async.waterfall([
            callback => {
                let sql = "SELECT `id`, `name` FROM `financial_plans` WHERE `is_active` = 1 AND `category_id` = ?";
                connection.query(sql, [category_id], (err, result) => {
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
                    message: 'financial plans addons add edit data fetched successfully',
                    data: {
                        financial_plans: result || []
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


exports.addFinancialPlanAddon = (req, res) => {
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
                description,
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const plan_id = parseInt(req.body.plan_id) || null;

            if (price > 0) {
                async.waterfall([
                    callback => {
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
                    },
                    callback => {
                        let sql = "INSERT INTO `financial_plans_addons` ( `description`, `price`, `plan_id`, `created_at`, `updated_at`) VALUES (?,?,?,NOW(),NOW())";
                        connection.query(sql, [description, price, plan_id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
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
                            message: 'financial plan addon added successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.editFinancialPlanAddon = (req, res) => {
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
                description
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const plan_id = parseInt(req.body.plan_id) || null;

            const id = req.params.id;

            let sql;

            if (price > 0) {
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_addons` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === 0) {
                                        res.status(400).send({
                                            message: 'financial plans addon has already been deactivated'
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plan does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
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
                    },
                    callback => {
                        sql = "UPDATE `financial_plans_addons` SET `description` = ?, `price` = ?,`plan_id` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [description, price, plan_id, id], (err, result) => {
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
                            message: 'financial plan addon updated successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}


exports.activateDeactivateFinancialPlanAddon = (req, res) => {
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
                const id = req.params.id;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_addons` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === request_type) {
                                        res.status(400).send({
                                            message: (request_type === 0 ? 'financial plans addon has already been deactivated' : 'financial plans addon has already been activated')
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plan does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        let sql = "UPDATE `financial_plans_addons` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 0 ? 'financial plan addon deactivated successfully' : 'financial plan addon activated successfully')
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

exports.fetchFinancialPlansAddons = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1--> active, 2 --> not active
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const plan_id = parseInt(req.body.plan_id) || 0;
            const search = req.body.search || "";
            let sql, requestTypeQuery, planQuery;
            const searchQuery = "fpa.`description` LIKE '" + search + "%'";

            if (plan_id && plan_id !== 0) {
                planQuery = "fpa.`plan_id` = " + plan_id;
            } else {
                planQuery = "1";
            }

            if (request_type === 1) {
                requestTypeQuery = "fpa.`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "fpa.`is_active` = 0";
            } else {
                requestTypeQuery = "1";
            }

            async.parallel([
                callback => {
                    sql = "SELECT fpa.`id`, fpa.`description`, fpa.`price`, fpa.`plan_id`, fpa.`is_active`, fpa.`created_at`, fpa.`updated_at`,  fp.`name` AS `plan`, fpc.`id` AS `category_id` FROM `financial_plans_addons` fpa LEFT JOIN `financial_plans` fp ON fp.`id` = fpa.`plan_id` LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + planQuery + " ORDER BY fpa.`updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_financial_plans_addons` FROM `financial_plans_addons` fpa WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + planQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_financial_plans_addons)
                            } else {
                                callback(null, 0)
                            }
                        }
                    })
                }
            ], (err, results) => {
                if (err) {
                    console.log(err)
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
                        message: 'financial plans addons list fetched successfully',
                        data: {
                            financial_plans_addons: data,
                            total_financial_plans_addons: results[1] || 0
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

exports.addFinancialPlanPricing = (req, res) => {
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
                name,
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const plan_id = parseInt(req.body.plan_id) || null;

            if (price > 0) {
                async.waterfall([
                    callback => {
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
                    },
                    callback => {
                        let sql = "INSERT INTO `financial_plans_pricings` ( `name`, `price`, `plan_id`, `created_at`, `updated_at`) VALUES (?,?,?,NOW(),NOW())";
                        connection.query(sql, [name, price, plan_id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
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
                            message: 'financial plan pricing added successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.editFinancialPlanPricing = (req, res) => {
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
                name
            } = req.body;

            const price = parseFloat(req.body.price) || 0;
            const plan_id = parseInt(req.body.plan_id) || null;

            const id = req.params.id;

            let sql;

            if (price > 0) {
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_pricings` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === 0) {
                                        res.status(400).send({
                                            message: 'financial plan pricing has been deactivated'
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plan does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
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
                    },
                    callback => {
                        sql = "UPDATE `financial_plans_pricings` SET `name` = ?, `price` = ?,`plan_id` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [name, price, plan_id, id], (err, result) => {
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
                            message: 'financial plan pricing updated successfully'
                        })
                    }
                })
            } else {
                res.status(400).send({
                    message: 'invalid price value'
                })
            }

        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}


exports.activateDeactivateFinancialPlanPricing = (req, res) => {
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
                const id = req.params.id;
                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `financial_plans_pricings` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result[0]) {
                                    if (result[0].is_active === request_type) {
                                        res.status(400).send({
                                            message: (request_type === 0 ? 'financial plans pricing has already been deactivated' : 'financial plans pricing has already been activated')
                                        })
                                    } else {
                                        callback(null)
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'financial plan does not exist'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        let sql = "UPDATE `financial_plans_pricings` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 0 ? 'financial plan pricing deactivated successfully' : 'financial plan pricing activated successfully')
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

exports.fetchFinancialPlansPricings = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1--> active, 2 --> not active
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const plan_id = parseInt(req.body.plan_id) || 0;
            const search = req.body.search || "";
            let sql, requestTypeQuery, planQuery;
            const searchQuery = "fpp.`name` LIKE '" + search + "%'";

            if (plan_id && plan_id !== 0) {
                planQuery = "fpp.`plan_id` = " + plan_id;
            } else {
                planQuery = "1";
            }

            if (request_type === 1) {
                requestTypeQuery = "fpp.`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "fpp.`is_active` = 0";
            } else {
                requestTypeQuery = "1";
            }

            async.parallel([
                callback => {
                    sql = "SELECT fpp.`id`, fpp.`name`, fpp.`price`, fpp.`plan_id`, fpp.`is_active`, fpp.`created_at`, fpp.`updated_at`,  fp.`name` AS `plan`, fpc.`id` AS `category_id` FROM `financial_plans_pricings` fpp LEFT JOIN `financial_plans` fp ON fp.`id` = fpp.`plan_id` LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + planQuery + " ORDER BY fpp.`updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_financial_plans_pricings` FROM `financial_plans_pricings` fpp WHERE " + searchQuery + " AND " + requestTypeQuery + " AND " + planQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_financial_plans_pricings)
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
                        message: 'financial plans pricings list fetched successfully',
                        data: {
                            financial_plans_pricings: data,
                            total_financial_plans_pricings: results[1] || 0
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



exports.showFinancialPlans = (req, res) => {
    const search = req.body.search || "";
    const sort = parseInt(req.body.sort) || 0;
    let sql, sortQuery;
    const searchQuery = "fp.`name` LIKE '" + search + "%'";
    if (sort === 1) {
        sortQuery = "fp.`price` DESC";
    } else {
        sortQuery = "fp.`price` ASC"
    }
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `name` FROM `financial_plans_categories` WHERE `is_active` = 1 ORDER BY `id`";
            connection.query(sql, [], (err, result) => {
                callback(err, result);
            })
        },
        (financialPlansCategories, callback) => {
            if (financialPlansCategories && financialPlansCategories.length > 0) {
                sql = "SELECT fp.`id`, fp.`name`, fp.`benefits`, fp.`price`, fp.`description`, IF(COUNT(fpa.`id`) > 0, 1, 0) AS `additional_charges` FROM `financial_plans` fp LEFT JOIN `financial_plans_addons` fpa ON fp.`id` = fpa.`plan_id` AND fpa.`is_active` = 1 WHERE fp.`is_active` = 1 AND fp.`category_id` = ? AND " + searchQuery + " GROUP BY fp.`id` ORDER BY " + sortQuery;
                async.each(financialPlansCategories, (financialPlansCategory, cb) => {
                    connection.query(sql, [financialPlansCategory.id], (err, result) => {
                        if (err) {
                            cb(err);
                        } else {
                            if (result && result.length > 0) {
                                financialPlansCategory['financial_plans'] = result;
                            } else {
                                financialPlansCategory['financial_plans'] = [];
                            }
                            cb(null)
                        }
                    })
                }, (err) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, financialPlansCategories)
                    }
                })
            } else {
                callback(null, null)
            }
        }
    ], (err, financialPlansCategories) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {

            res.status(200).send({
                message: 'financial plans list fetched successfully',
                data: financialPlansCategories || []
            })
        }
    })
}

exports.showFinancialPlan = (req, res) => {
    const id = parseInt(req.params.id) || 0;
    if (id) {
        let sql;
        async.waterfall([
            callback => {
                sql = "SELECT fp.`id`, fp.`name`, fp.`description`, fp.`docs`, fp.`benefits`, fp.`price` FROM `financial_plans` fp LEFT JOIN `financial_plans_categories` fpc ON fpc.`id` = fp.`category_id` WHERE fp.`is_active` = 1 AND fpc.`is_active` = 1 AND fp.`id` = ?";
                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0])
                        } else {
                            res.status(400).send({
                                message: 'plan not found'
                            })
                        }
                    }
                })
            },
            (plan, callback) => {
                async.parallel([
                    cb => {
                        sql = "SELECT `description`, `price` FROM `financial_plans_addons` WHERE `is_active` = 1 AND `plan_id` = ? ORDER BY `price`";
                        connection.query(sql, [id], (err, result) => {
                            cb(err, result)
                        })
                    },
                    cb => {
                        sql = "SELECT `name`, `price` FROM `financial_plans_pricings` WHERE `is_active` = 1 AND `plan_id` = ? ORDER BY `price`";
                        connection.query(sql, [id], (err, result) => {
                            cb(err, result)
                        })
                    }
                ], (err, results) => {
                    callback(err, plan, results[0], results[1])
                })
            }
        ], (err, plan, addons, pricings) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occured'
                })
            } else {

                res.status(200).send({
                    message: 'financial plan fetched successfully',
                    data: {
                        plan: plan,
                        addons: addons,
                        pricings: pricings
                    }
                })
            }
        })
    } else {
        res.status(400).send({
            message: 'plan not found'
        })
    }
}