
const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone, timeFormatter } = require('../Utils/commonFunctions');

exports.enquireNow = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            email,
            phone,
            property_id,
        } = req.body;

        async.waterfall([
            callback => {
                sql = "SELECT `id` FROM `properties` WHERE `id` = ? AND `is_active` = 1 AND `is_approved` = 1";
                connection.query(sql, [property_id], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null)
                        } else {
                            res.status(400).send({
                                message: 'property not available'
                            })
                        }
                    }
                })
            },
            callback => {
                async.parallel([
                    cb => {
                        const enquiry_id = "ENQUIRY0" + new Date().getTime();
                        sql = "INSERT INTO `enquiries` (`enquiry_id`, `email`, `phone`, `property_id`, `created_at`) VALUES (?,?,?,?,NOW())";
                        connection.query(sql, [enquiry_id, email, phone, property_id], (err, result) => {
                            cb(err, result)
                        })
                    },
                    cb => {
                        sql = "UPDATE `properties` SET `enquiries` = `enquiries` + 1 WHERE `id` = ?";
                        connection.query(sql, [property_id], (err, result) => {
                            cb(null, null)
                        })
                    }
                ], (err, results) => {
                    callback(err, results[0])
                })
            }
        ], (err, result) => {
            console.log(err)
            if (err) {
                res.status(400).send({
                    message: 'some error occurred'
                })
            } else {
                res.status(200).send({
                    message: 'enquired successfully'
                })
            }
        })
    }
}

exports.fetchEnquiries = (req, res) => {
    const user = res.locals.user;
    if (user.role === 1 || user.role === 2 || (user.role === 3 && user.service_ids.split(',').indexOf('1') !== -1) && user.role === 4) {
        const offset = parseInt(req.body.offset) || 0;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";

        let sql, userQuery = 1;
        const searchQuery = "e.`enquiry_id` LIKE '" + search + "%'";

        if (user.role === 4) {
            userQuery = "p.`user_id` = " + user.id + " AND p.`user_role` = 4";
        }

        if (user.role === 3) {
            userQuery = "p.`admin_id` = " + user.id;
        }

        async.parallel([
            callback => {
                sql = "SELECT e.`id`, e.`enquiry_id`, e.`email`, e.`phone`, e.`created_at` FROM `enquiries` e LEFT JOIN `properties` p ON p.`id` = e.`property_id` WHERE " + searchQuery + " AND " + userQuery + " ORDER BY e.`created_at` DESC LIMIT " + offset + "," + limit;
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT COUNT(e.`id`) AS `total_enquiries` FROM `enquiries` e LEFT JOIN `properties` p ON p.`id` = e.`property_id` WHERE " + searchQuery + " AND " + userQuery;
                connection.query(sql, [], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0].total_enquiries)
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
                            created_at: getDateTimeInTimezone(item.created_at)
                        })
                    })
                }
                res.status(200).send({
                    message: 'enquiries fetched successfully',
                    data: {
                        enquiries: data,
                        total_enquiries: results[1] || 0
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