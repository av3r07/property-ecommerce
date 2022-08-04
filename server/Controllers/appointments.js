
const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone, timeFormatter } = require('../Utils/commonFunctions');

exports.bookAppointment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const service_id = parseInt(req.body.service_id) || 0;
        if (service_id === 1 || service_id === 2) {
            const {
                first_name,
                last_name,
                email,
                phone,
                query,
                slot_id
            } = req.body;

            const date = new Date(req.body.date);

            if (date !== 'Invalid Date') {
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const dayOfMonth = date.getDate();
                const currentDate = new Date(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                const currentDayOfMonth = currentDate.getDate();

                if (year >= currentYear && month >= currentMonth) {
                    let invalidTimeFlag = false;
                    if (year === currentYear && month === currentMonth && dayOfMonth < currentDayOfMonth) {
                        invalidTimeFlag = true;
                    }

                    if (!invalidTimeFlag) {
                        let sql;

                        async.waterfall([
                            callback => {
                                sql = "SELECT s.`is_active` AS `slot_status`, sch.`is_active` AS `schedule_status`, sch.`is_deleted` FROM `slots` s LEFT JOIN `schedules` sch ON s.`schedule_id` = sch.`id` WHERE s.`id` = ?";
                                connection.query(sql, [slot_id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            if (result[0].slot_status === 0 || result[0].is_deleted === 1 || result[0].schedule_status === 0) {
                                                res.status(400).send({
                                                    message: 'not a valid slot'
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'slot not found'
                                            })
                                        }
                                    }
                                })
                            },
                            callback => {
                                sql = "SELECT `id` FROM `appointments` WHERE `slot_id` = ? AND `date` = DATE(?)";
                                connection.query(sql, [slot_id, date], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            res.status(400).send({
                                                message: 'slot already booked'
                                            })
                                        } else {
                                            callback(null)
                                        }
                                    }
                                })
                            },
                            callback => {

                                const appointment_id = "APPOINTMENT0" + new Date().getTime();
                                sql = "INSERT INTO `appointments` (`appointment_id`,`first_name`, `last_name`, `email`, `phone`, `query`, `date`, `status`, `slot_id`, `service_id`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,NOW(), NOW())";
                                connection.query(sql, [appointment_id, first_name, last_name, email, phone, query, date, 0, slot_id, service_id], (err, result) => {
                                    callback(err, result)
                                })
                            }
                        ], (err, result) => {
                            if (err) {
                                console.log(err)
                                res.status(400).send({
                                    message: 'some error occurred'
                                })
                            } else {
                                res.status(200).send({
                                    message: 'appointment booked successfully',
                                    data: {
                                        appointment_id: result.insertId
                                    }
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            message: 'invalid date'
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'invalid date'
                    })
                }

            } else {
                res.status(400).send({
                    message: 'invalid date'
                })
            }
        } else {
            res.status(400).send({
                message: 'invalid service selected'
            })
        }
    }
}

exports.editAppointment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const service_id = parseInt(req.body.service_id) || 0;
        if (service_id === 1 || service_id === 2) {
            const {
                first_name,
                last_name,
                email,
                phone,
                query,
                slot_id
            } = req.body;

            const appointment_id = req.params.id;

            const date = new Date(req.body.date);

            if (date !== 'Invalid Date') {
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const dayOfMonth = date.getDate();
                const currentDate = new Date(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                const currentDayOfMonth = currentDate.getDate();

                if (year >= currentYear && month >= currentMonth) {
                    let invalidTimeFlag = false;
                    if (year === currentYear && month === currentMonth && dayOfMonth < currentDayOfMonth) {
                        invalidTimeFlag = true;
                    }

                    if (!invalidTimeFlag) {
                        let sql;

                        async.waterfall([
                            callback => {
                                sql = "SELECT s.`is_active` AS `slot_status`, sch.`is_active` AS `schedule_status`, sch.`is_deleted` FROM `slots` s LEFT JOIN `schedules` sch ON s.`schedule_id` = sch.`id` WHERE s.`id` = ?";
                                connection.query(sql, [slot_id], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            if (result[0].slot_status === 0 || result[0].is_deleted === 1 || result[0].schedule_status === 0) {
                                                res.status(400).send({
                                                    message: 'not a valid slot'
                                                })
                                            } else {
                                                callback(null)
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'slot not found'
                                            })
                                        }
                                    }
                                })
                            },
                            callback => {
                                sql = "SELECT `id` FROM `appointments` WHERE `slot_id` = ? AND `date` = DATE(?)";
                                connection.query(sql, [slot_id, date], (err, result) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        if (result && result[0]) {
                                            res.status(400).send({
                                                message: 'slot already booked'
                                            })
                                        } else {
                                            callback(null)
                                        }
                                    }
                                })
                            },
                            callback => {
                                sql = "UPDATE `appointments` SET `first_name` = ?, `service_id` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `query` = ?, `date` = ?, `slot_id` = ?, `updated_at` = NOW() WHERE `id` = ?";
                                connection.query(sql, [first_name, service_id, last_name, email, phone, query, date, slot_id, appointment_id], (err, result) => {
                                    callback(err, result)
                                })
                            }
                        ], (err, result) => {
                            if (err) {
                                res.status(400).send({
                                    message: 'some error occurred'
                                })
                            } else {
                                res.status(200).send({
                                    message: 'appointment booked successfully',
                                })
                            }
                        })
                    } else {
                        res.status(400).send({
                            message: 'invalid date'
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'invalid date'
                    })
                }

            } else {
                res.status(400).send({
                    message: 'invalid date'
                })
            }
        } else {
            res.status(400).send({
                message: 'invalid service selected'
            })
        }
    }
}

exports.completeAppointment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        const id = req.params.id;
        if (user.role === 1 || user.role === 2 || user.role === 3) {
            let sql;
            async.waterfall([
                callback => {
                    sql = "SELECT ap.`status`, ap.`service_id`, ap.`date`, s.`time` FROM `appointments` ap LEFT JOIN `slots` s ON s.`id` = ap.`slot_id` WHERE ap.`id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                if (result[0].status === 1) {
                                    res.status(400).send({
                                        message: 'appointment already marked as completed'
                                    })
                                } else {
                                    if (new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime() > new Date(new Date(`${("" + result[0].date).split(':')[0]} ${result[0].time}`).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime()) {
                                        if (user.role === 3 && user.service_ids.split(',').indexOf(result[0].service_id) === -1) {
                                            res.status(403).send({
                                                message: 'not authorized'
                                            })
                                        } else {
                                            callback(null)
                                        }
                                    } else {
                                        res.status(400).send({
                                            message: 'appointment date and time is beyond current time'
                                        })
                                    }
                                }
                            } else {
                                res.status(400).send({
                                    message: 'appointment not found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    sql = "UPDATE `appointments` SET `status` = 1, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        callback(err)
                    })
                }
            ], (err) => {
                if (err) {
                    res.status(400).send({
                        message: 'some error occured'
                    });
                } else {
                    res.status(200).send({
                        message: 'appointment marked completed successfully',
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

exports.fetchAppointments = (req, res) => {
    const user = res.locals.user;
    if (user.role === 1 || user.role === 2 || user.role === 3) {
        const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1 --> pending, 2 --> completed
        const offset = parseInt(req.body.offset) || 0;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";

        let sql, requestTypeQuery = 1, serviceQuery = 1;
        if (user.role === 3) {
            serviceQuery = "FIND_IN_SET(ap.`service_id`, '" + user.service_ids + "')"
        }
        const searchQuery = "ap.`appointment_id` LIKE '" + search + "%'"
        if (request_type === 1) {
            requestTypeQuery = "ap.`status` = 0";
        } else if (request_type === 2) {
            requestTypeQuery = "ap.`status` = 1";
        }

        async.parallel([
            callback => {
                sql = "SELECT ap.`id`, ap.`appointment_id`,ap.`first_name`, ap.`last_name`, ap.`email`, ap.`phone`, ap.`query`, ap.`date`, ap.`status`, ap.`slot_id`, s.`time`, ap.`service_id`, ap.`created_at`, ap.`updated_at` FROM `appointments` ap LEFT JOIN `slots` s ON s.`id` = ap.`slot_id` WHERE " + requestTypeQuery + " AND " + searchQuery + " AND " + serviceQuery + " ORDER BY ap.`date` DESC, s.`time` DESC LIMIT " + offset + "," + limit;
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT COUNT(ap.`id`) AS `total_appointments` FROM `appointments` ap WHERE " + requestTypeQuery + " AND " + searchQuery + " AND " + serviceQuery;
                connection.query(sql, [], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0].total_appointments)
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
                            date: getDateTimeInTimezone(item.date),
                            time: timeFormatter(item.time, true),
                            created_at: getDateTimeInTimezone(item.created_at),
                            updated_at: getDateTimeInTimezone(item.updated_at)
                        })
                    })
                }
                res.status(200).send({
                    message: 'appointments fetched successfully',
                    data: {
                        appointments: data,
                        total_appointments: results[1] || 0
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