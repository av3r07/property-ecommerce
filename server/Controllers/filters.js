const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');


exports.addFilter = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const type = parseInt(req.body.type); // 1 --> range, 2 --> equal to, 3 -->less than, 4 --> greater than
            if (type === 1 || type === 2 || type === 3 || type === 4) {
                const category_id = parseInt(req.body.category_id);
                if (category_id) {
                    const value = parseInt(req.body.value) || 0;
                    const name = req.body.name;
                    const min_value = parseInt(req.body.min_value) || 0;
                    const max_value = parseInt(req.body.max_value) || 0;
                    let placement_order = parseInt(req.body.placement_order) || 0;
                    if (type === 3 || type === 4) {
                        placement_order = 0;
                    }
                    let sql;
                    let values = [];

                    if ((type === 2 || type === 1) && !placement_order) {
                        res.status(400).send({
                            message: 'invalid placement order'
                        })
                    } else {
                        async.waterfall([
                            callback => {
                                sql = "SELECT `id` FROM `filter_categories` WHERE `id` = ?";
                                connection.query(sql, [category_id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            callback(null)
                                        } else {
                                            res.status(400).send({
                                                message: 'filter category not found'
                                            })
                                        }
                                    }
                                })
                            },
                            callback => {
                                sql = "SELECT `type`, `value`, `max_value`, `min_value`, `placement_order` FROM `filters` WHERE `category_id` = ?";
                                connection.query(sql, [category_id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result.length > 0) {
                                            let placementOrderFlag = false;
                                            let filterRedundancyFlag = false;
                                            for (let i = 0; i < result.length; i++) {
                                                if (result[i].placement_order === placement_order && (type === 2 || type === 1)) {
                                                    placementOrderFlag = true;
                                                    break;
                                                } else {
                                                    if (type === 1) {
                                                        if (result[i].type === 1) {
                                                            if ((min_value >= result[i].max_value && min_value <= result[i].max_value) || (max_value >= result[i].max_value && max_value <= result[i].max_value)) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 2) {
                                                            if (min_value === result[i].value || max_value === result[i].value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 3) {
                                                            if (min_value <= result[i].max_value || max_value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 4) {
                                                            if (min_value >= result[i].min_value || max_value >= result[i].min_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        }
                                                    } else if (type === 2) {
                                                        if (result[i].type === 1) {
                                                            if (value >= result[i].max_value && value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 2) {
                                                            if (value === result[i].value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 3) {
                                                            if (value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 4) {
                                                            if (value >= result[i].min_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        }
                                                    } else if (type === 3) {
                                                        if (result[i].type === 1) {
                                                            if (max_value >= result[i].max_value && max_value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 2) {
                                                            if (max_value === result[i].value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 3) {
                                                            filterRedundancyFlag = true;
                                                        } else if (result[i].type === 4) {
                                                            if (max_value >= result[i].min_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        }
                                                    } else if (type === 4) {
                                                        if (result[i].type === 1) {
                                                            if (min_value >= result[i].max_value && min_value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 2) {
                                                            if (min_value === result[i].value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 3) {
                                                            if (min_value <= result[i].max_value) {
                                                                filterRedundancyFlag = true;
                                                                break;
                                                            }
                                                        } else if (result[i].type === 4) {
                                                            filterRedundancyFlag = true;
                                                        }
                                                    }
                                                }
                                                if (placementOrderFlag || filterRedundancyFlag) {
                                                    break;
                                                }
                                            }

                                            if (placementOrderFlag || filterRedundancyFlag) {
                                                res.status(400).send({
                                                    message: (placementOrderFlag ? 'placement order already taken' : "filter is redundant")
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            callback(null)
                                        }
                                    }
                                })
                            },
                            callback => {
                                if (type === 1) {
                                    if (min_value && max_value && (min_value < max_value)) {
                                        sql = "INSERT INTO `filters` (`name`, `type`, `category_id`, `min_value`, `value`, `max_value`, `placement_order`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
                                        values = [name, type, category_id, min_value, null, max_value, placement_order];
                                        callback(null);
                                    } else {
                                        res.status(400).send({
                                            message: 'invalid max or min value'
                                        })
                                    }
                                } else if (type === 2) {
                                    if (value) {
                                        sql = "INSERT INTO `filters` (`name`, `type`, `category_id`, `min_value`, `value`, `max_value`, `placement_order`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
                                        values = [name, type, category_id, null, value, null, placement_order];
                                        callback(null);
                                    } else {
                                        res.status(400).send({
                                            message: 'invalid value'
                                        })
                                    }
                                } else if (type === 3) {
                                    if (max_value) {
                                        sql = "INSERT INTO `filters` (`name`, `type`, `category_id`, `min_value`, `value`, `max_value`, `placement_order`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
                                        values = [name, type, category_id, null, null, max_value, placement_order];
                                        callback(null);
                                    } else {
                                        res.status(400).send({
                                            message: 'invalid max value'
                                        })
                                    }
                                } else if (type === 4) {
                                    if (min_value) {
                                        sql = "INSERT INTO `filters` (`name`, `type`, `category_id`, `min_value`, `value`, `max_value`, `placement_order`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,NOW(),NOW())";
                                        values = [name, type, category_id, min_value, null, null, placement_order];
                                        callback(null);
                                    } else {
                                        res.status(400).send({
                                            message: 'invalid min value'
                                        })
                                    }
                                } else {
                                    callback(null);
                                }
                            },
                            callback => {
                                if (values.length > 0) {
                                    connection.query(sql, values, (err, result) => {
                                        if (err) {
                                            callback(err)
                                        } else {
                                            callback(null)
                                        }
                                    })
                                } else {
                                    res.status(400).send({
                                        message: 'invalid filter type'
                                    })
                                }
                            }
                        ], (err) => {
                            if (err) {
                                res.status(400).send({
                                    message: 'some error occured'
                                })
                            } else {
                                res.status(200).send({
                                    message: 'filter added successfully'
                                })
                            }
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'invalid filter category'
                    })
                }
            } else {
                res.status(400).send({
                    message: 'invalid filter type'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.editFilter = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const value = parseInt(req.body.value) || 0;
            const name = req.body.name;
            const min_value = parseInt(req.body.min_value) || 0;
            const max_value = parseInt(req.body.max_value) || 0;
            const placement_order = parseInt(req.body.placement_order) || 0;
            const id = req.params.id;
            let sql, values = [];

            async.waterfall([
                callback => {
                    sql = "SELECT `type`, `category_id`, `is_active` FROM `filters` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                if ((result[0].type === 1 || result[0].type === 2) && !placement_order) {
                                    res.status(400).send({
                                        message: 'invalid placement order'
                                    })
                                } else if (result[0].is_active === 0) {
                                    res.status(400).send({
                                        message: 'filter has been deactivated'
                                    })
                                } else {
                                    callback(null, result[0].category_id, result[0].type)
                                }
                            } else {
                                res.status(400).send({
                                    message: 'filter not found'
                                })
                            }
                        }
                    })
                },
                (categoryId, type, callback) => {
                    sql = "SELECT `type`, `value`, `max_value`, `min_value`, `placement_order` FROM `filters` WHERE `category_id` = ? AND `id` != ?";
                    connection.query(sql, [categoryId, id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result.length > 0) {
                                let placementOrderFlag = false;
                                let filterRedundancyFlag = false;
                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].placement_order === placement_order && (type === 2 || type === 1)) {
                                        placementOrderFlag = true;
                                        break;
                                    } else {
                                        if (type === 1) {
                                            if (result[i].type === 1) {
                                                if ((min_value >= result[i].min_value && min_value <= result[i].max_value) || (max_value >= result[i].min_value && max_value <= result[i].max_value)) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 2) {
                                                if (min_value === result[i].value || max_value === result[i].value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 3) {
                                                if (min_value <= result[i].max_value || max_value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 4) {
                                                if (min_value >= result[i].min_value || max_value >= result[i].min_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            }
                                        } else if (type === 2) {
                                            if (result[i].type === 1) {
                                                if (value >= result[i].min_value && value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 2) {
                                                if (value === result[i].value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 3) {
                                                if (value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 4) {
                                                if (value >= result[i].min_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            }
                                        } else if (type === 3) {
                                            if (result[i].type === 1) {
                                                if (max_value >= result[i].min_value && max_value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 2) {
                                                if (max_value === result[i].value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 3) {
                                                filterRedundancyFlag = true;
                                            } else if (result[i].type === 4) {
                                                if (max_value >= result[i].min_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            }
                                        } else if (type === 4) {
                                            if (result[i].type === 1) {
                                                if (min_value >= result[i].min_value && min_value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 2) {
                                                if (min_value === result[i].value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 3) {
                                                if (min_value <= result[i].max_value) {
                                                    filterRedundancyFlag = true;
                                                    break;
                                                }
                                            } else if (result[i].type === 4) {
                                                filterRedundancyFlag = true;
                                            }
                                        }
                                    }
                                    if (placementOrderFlag || filterRedundancyFlag) {
                                        break;
                                    }
                                }

                                if (placementOrderFlag || filterRedundancyFlag) {
                                    res.status(400).send({
                                        message: (placementOrderFlag ? 'placement order already taken' : "filter is redundant")
                                    })
                                } else {
                                    callback(null, type)
                                }
                            } else {
                                callback(null, type)
                            }
                        }
                    })
                },
                (type, callback) => {
                    if (type === 1) {
                        if (min_value && max_value && (min_value < max_value)) {
                            sql = "UPDATE `filters` SET `name` = ?, `min_value` = ?, `value` = ?, `max_value` = ?, `placement_order` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            values = [name, min_value, null, max_value, placement_order, id];
                            callback(null);
                        } else {
                            res.status(400).send({
                                message: 'invalid max or min value'
                            })
                        }
                    } else if (type === 2) {
                        if (value) {
                            sql = "UPDATE `filters` SET `name` = ?, `min_value` = ?, `value` = ?, `max_value` = ?, `placement_order` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            values = [name, null, value, null, placement_order, id];
                            callback(null);
                        } else {
                            res.status(400).send({
                                message: 'invalid value'
                            })
                        }
                    } else if (type === 3) {
                        if (max_value) {
                            sql = "UPDATE `filters` SET `name` = ?, `min_value` = ?, `value` = ?, `max_value` = ?, `placement_order` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            values = [name, null, null, max_value, placement_order, id];
                            callback(null);
                        } else {
                            res.status(400).send({
                                message: 'invalid max value'
                            })
                        }
                    } else if (type === 4) {
                        if (min_value) {
                            sql = "UPDATE `filters` SET `name` = ?, `min_value` = ?, `value` = ?, `max_value` =, `placement_order` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            values = [name, min_value, null, null, placement_order, id];
                            callback(null);
                        } else {
                            res.status(400).send({
                                message: 'invalid min value'
                            })
                        }
                    } else {
                        callback(null);
                    }
                },
                callback => {
                    if (values.length > 0) {
                        connection.query(sql, values, (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null)
                            }
                        })
                    } else {
                        res.status(400).send({
                            message: 'invalid filter type'
                        })
                    }
                }
            ], (err) => {
                if (err) {
                    res.status(400).send({
                        message: 'some error occured'
                    })
                } else {
                    res.status(200).send({
                        message: 'filter updated successfully'
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

exports.fetchFilters = (req, res) => {
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
            const category_id = parseInt(req.body.category_id) || 0;
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";
            const searchQuery = "f.`name` LIKE '" + search + "%'";
            let sql, requestTypeQuery, categoryQuery = 1;
            if (request_type === 1) {
                requestTypeQuery = "f.`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "f.`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            if (category_id) {
                categoryQuery = "f.`category_id` = " + category_id;
            }

            async.parallel([
                callback => {
                    sql = "SELECT f.`id`, f.`type`, f.`name`, f.`placement_order`, f.`max_value`, f.`min_value`, f.`value`, f.`is_active`, f.`updated_at`, f.`created_at`, COALESCE(fc.`name`, '') AS `category_name` FROM `filters` f LEFT JOIN `filter_categories` fc ON fc.`id` = f.`category_id` WHERE " + requestTypeQuery + " AND " + categoryQuery + " AND " + searchQuery + " ORDER BY `updated_at` LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result);
                    })
                },
                callback => {
                    sql = "SELECT COUNT(f.`id`) AS `total_filters` FROM `filters` f WHERE " + requestTypeQuery + " AND " + categoryQuery + " AND " + searchQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_filters)
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
                        message: 'filters list fetched successfully',
                        data: {
                            filters: data,
                            total_filters: results[1] || 0
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

exports.fetchFiltersAddEditData = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        async.waterfall([
            callback => {
                sql = "SELECT `id`, `name` FROM `filter_categories` ORDER BY `id`";
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
                    message: 'filters add edit fetched successfully',
                    data: {
                        filter_categories: result || []
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
exports.activateDeactivateFilter = (req, res) => {
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
                        sql = "SELECT `is_active` FROM `filters` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active !== request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type === 1 ? "filter has already been activated" : "filter has already been deactivated")
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'filter not found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `filters` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type === 1 ? "filter activated successfully" : "filter deactivated successfully")
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


exports.showFilters = (req, res) => {
    let sql;
    async.parallel([
        callback => {
            async.waterfall([
                cb => {
                    sql = "SELECT `id`, `name` FROM `filter_categories` ORDER BY `placement_order`";
                    connection.query(sql, [], (err, result) => {
                        cb(err, result);
                    })
                },
                (filterCategories, cb) => {
                    if (filterCategories && filterCategories.length > 0) {
                        sql = "SELECT `id`, `name` FROM `filters` WHERE `is_active` = 1 AND `category_id` = ? ORDER BY `type`, `placement_order`";
                        async.each(filterCategories, (filterCategory, cb1) => {
                            connection.query(sql, [filterCategory.id], (err, result) => {
                                if (err) {
                                    cb1(err);
                                } else {
                                    if (result && result.length > 0) {
                                        filterCategory['filters'] = result;
                                    } else {
                                        filterCategory['filters'] = [];
                                    }
                                    cb1(null)
                                }
                            })
                        }, (err) => {
                            if (err) {
                                cb(err)
                            } else {
                                cb(null, filterCategories)
                            }
                        })
                    } else {
                        cb(null, null)
                    }
                }
            ], (err, filterCategories) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, filterCategories)
                }
            })
        },
        callback => {
            sql = "SELECT `id`, `name` FROM `property_types` WHERE `is_active` = 1 ORDER BY `id`";
            connection.query(sql, [], (err, result) => {
                callback(err, result);
            })
        },
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
            if (results[2]) {
                results[2].forEach(item => {
                    data.push(item.city)
                })
            }
            if (results[3]) {
                results[3].forEach(item => {
                    data.push(item.state)
                })
            }
            if (results[4]) {
                results[4].forEach(item => {
                    data.push(item.country)
                })
            }
            data.sort();
            res.status(200).send({
                message: "filters data fetched successfully",
                data: {
                    filters: results[0] || [],
                    property_types: results[1] || [],
                    locations: data
                }
            })
        }
    })
}
