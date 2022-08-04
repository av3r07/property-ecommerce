
const async = require('async');
const connection = require('../db/database');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone, timeFormatter } = require('../Utils/commonFunctions');


exports.addSchedule = (req, res) => {
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
                start_time,
                end_time
            } = req.body;
            const day = parseInt(req.body.day); // 1 --> sunday, 2 --> monday, 3 --> tuesday, 4 --> wednesday, 5 --> thursday, 6 --> friday, 7 --> saturday

            if (day >= 1 && day <= 7) {

                const startTime = start_time.split(':');

                if (startTime.length === 2) {

                    const startTimeHours = parseInt(startTime[0].trim());
                    const startTimeMinutes = parseInt(startTime[1].trim());

                    if ((startTimeHours >= 0 && startTimeHours <= 24) && (startTimeMinutes >= 0 && startTimeMinutes <= 60)) {

                        const totalStartTime = (startTimeHours * 60) + startTimeMinutes;

                        if (totalStartTime >= 600 && totalStartTime <= 1080) {

                            const endTime = end_time.split(':');

                            if (endTime.length === 2) {

                                const endTimeHours = parseInt(endTime[0].trim());
                                const endTimeMinutes = parseInt(endTime[1].trim());

                                if ((endTimeHours >= 0 && endTimeHours <= 24) && (endTimeMinutes >= 0 && endTimeMinutes <= 60)) {

                                    const totalEndTime = (endTimeHours * 60) + endTimeMinutes;

                                    const timeDifference = totalEndTime - totalStartTime;

                                    if (timeDifference <= 0 || timeDifference % 20 !== 0) {
                                        res.status(400).send({
                                            message: 'difference between end time and start time should be positive and multiple of 20 minutes'
                                        });
                                    } else {
                                        async.waterfall([
                                            callback => {
                                                sql = "SELECT `id` FROM `schedules` WHERE ((TIME('" + startTimeHours + ":" + startTimeMinutes + "') >= `start_time` AND TIME('" + startTimeHours + ":" + startTimeMinutes + "') <= `end_time`) OR (TIME('" + endTimeHours + ":" + endTimeMinutes + "') >= `start_time` AND TIME('" + endTimeHours + ":" + endTimeMinutes + "') <= `end_time`)) AND `day` = " + day + " AND `is_deleted` = 0 LIMIT 1";
                                                connection.query(sql, [], (err, result) => {
                                                    if (err) {
                                                        callback(err)
                                                    } else {
                                                        if (result && result.length === 1) {
                                                            res.status(400).send({
                                                                message: 'start time or end time is clashing with other schedule interval'
                                                            })
                                                        } else {
                                                            callback(null)
                                                        }
                                                    }
                                                })
                                            },
                                            callback => {
                                                sql = "INSERT INTO `schedules` (`day`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES (?,?,?,NOW(),NOW())";
                                                connection.query(sql, [day, start_time, end_time], (err, result) => {
                                                    if (err) {
                                                        callback(err)
                                                    } else {
                                                        if (result && result.insertId) {
                                                            callback(null, result.insertId);
                                                        } else {
                                                            callback('error')
                                                        }
                                                    }
                                                })
                                            },
                                            (scheduleId, callback) => {
                                                const slots = [];
                                                for (let time = totalStartTime; time < totalEndTime; time = time + 20) {
                                                    slots.push({
                                                        time: `${parseInt(time / 60)}:${time % 60}`
                                                    });
                                                }
                                                callback(null, scheduleId, slots);
                                            },
                                            (scheduleId, slots, callback) => {
                                                async.each(slots, (slot, cb) => {
                                                    sql = "INSERT INTO `slots` (`schedule_id`,`time`, `created_at`, `updated_at`) VALUES (?,?,NOW(),NOW())";
                                                    connection.query(sql, [scheduleId, slot.time], (err, result) => {
                                                        cb()
                                                    })
                                                }, () => {
                                                    callback(null)
                                                })
                                            }
                                        ], (err) => {
                                            if (err) {
                                                res.status(400).send({
                                                    message: 'some error occured'
                                                })
                                            } else {
                                                res.status(200).send({
                                                    message: 'schedule added successfully'
                                                })
                                            }
                                        })
                                    }

                                } else {
                                    res.status(400).send({
                                        message: 'invalid end time'
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: 'invalid end time'
                                })
                            }
                        } else {
                            res.status(400).send({
                                message: 'start time must be between 10:00 AM and 6:00 PM'
                            })
                        }
                    } else {
                        res.status(400).send({
                            message: 'invalid start time'
                        })
                    }
                } else {
                    res.status(400).send({
                        message: 'invalid start time'
                    })
                }
            } else {
                res.status(400).send({
                    message: 'invalid day'
                })
            }
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.fetchSchedules = (req, res) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        const request_type = parseInt(req.body.request_type) || 0; // 0 --> all, 1 --> active, 2 --> not active
        const day = parseInt(req.body.day) || 0;
        const offset = parseInt(req.body.offset) || 0;
        const limit = parseInt(req.body.limit) || 10;
        let sql, requestQuery, dayQuery;

        if (request_type === 1) {
            requestQuery = "`is_active` = 1";
        } else if (request_type === 2) {
            requestQuery = "`is_active` = 0";
        } else {
            requestQuery = 1;
        }

        if (day) {
            dayQuery = "`day` = " + day;
        } else {
            dayQuery = 1;
        }

        if (day < 0 || day > 7) {
            res.status(400).send({
                message: 'invalid day'
            })
        } else {
            async.parallel([
                callback => {
                    sql = "SELECT `id`, `start_time`, `end_time`, `day`, `is_active`, `updated_at`, `created_at` FROM `schedules` WHERE `is_deleted` = 0 AND " + requestQuery + " AND " + dayQuery + " ORDER BY `day` ASC, `start_time` ASC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result)
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_schedules` FROM `schedules` WHERE `is_deleted` = 0 AND " + requestQuery + " AND " + dayQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_schedules)
                            } else {
                                callback(null, null)
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
                                day: days[item.day - 1],
                                start_time: timeFormatter(item.start_time, true),
                                end_time: timeFormatter(item.end_time, true),
                                created_at: getDateTimeInTimezone(item.created_at),
                                updated_at: getDateTimeInTimezone(item.updated_at)
                            })
                        })
                    }
                    res.status(200).send({
                        message: 'schedules list fetched successfully',
                        data: {
                            schedules: data,
                            total_schedules: results[1] || 0
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

exports.fetchSlots = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2) {
        const id = req.params.id;
        async.waterfall([
            callback => {
                sql = "SELECT `is_deleted` FROM `schedules` WHERE `id` = ?";
                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        if (result && result.length > 0) {
                            if (result[0].is_deleted != 1) {
                                callback(null)
                            } else {
                                res.status(403).send({
                                    message: 'schedule has been deleted'
                                })
                            }
                        } else {
                            res.status(400).send({
                                message: 'invalid schedule'
                            })
                        }
                    }
                })
            },
            callback => {
                sql = "SELECT `id`, `time`, `created_at`, `updated_at`, `is_active` FROM `slots` WHERE `schedule_id` = ? ORDER BY `time` ASC";
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
                const data = []
                if (result && result.length > 0) {
                    result.map(item => {
                        data.push({
                            ...item,
                            time: timeFormatter(item.time),
                            created_at: getDateTimeInTimezone(item.created_at),
                            updated_at: getDateTimeInTimezone(item.updated_at)
                        })
                    })
                }

                res.status(200).send({
                    message: 'slots fetched successfully',
                    data: data
                })
            }
        })
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.activateDeactivateSchedule = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            if (req.body.request_type == 1 || req.body.request_type == 0) {
                const id = req.params.id;
                const request_type = req.body.request_type;
                let sql;

                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `schedules` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err);
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active != request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type == 1 ? 'schedule has already been activated' : 'schedule has already been deactivated')
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'no schedule found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `schedules` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: 'some error occurred'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type == 1 ? 'schedule activated successfully' : 'schedule deactivated successfully')
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

exports.deleteSchedule = (req, res) => {
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
            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `is_deleted` FROM `schedules` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err);
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_deleted != 1) {
                                    callback(null)
                                } else {
                                    res.status(403).send({
                                        message: 'schedule has already been deleted'
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: 'no schedule found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    sql = "UPDATE `schedules` SET `is_deleted` = 1, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
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
                        message: 'some error occurred'
                    })
                } else {
                    res.status(200).send({
                        message: 'schedule deleted successfully'
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

exports.activateDeactivateSlot = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            if (req.body.request_type == 1 || req.body.request_type == 0) {
                const id = req.params.id;
                const request_type = req.body.request_type;
                let sql;

                async.waterfall([
                    callback => {
                        sql = "SELECT `is_active` FROM `slots` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err);
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active != request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type == 1 ? 'slot has already been activated' : 'slot has already been deactivated')
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'no slot found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `slots` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: 'some error occurred'
                        })
                    } else {
                        res.status(200).send({
                            message: (request_type == 1 ? 'slot activated successfully' : 'slot deactivated successfully')
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

exports.showSlots = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const time_type = req.body.time_type;
        const date = new Date(req.body.date)


        if (time_type === 'AM' || time_type === 'PM') {
            if (date !== 'Invalid Date') {
                const day = date.getDay();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const dayOfMonth = date.getDate();
                const currentDate = new Date(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                const currentDayOfMonth = currentDate.getDate();

                if (year >= currentYear) {
                    if (month >= currentMonth) {
                        if (month === currentMonth && dayOfMonth < currentDayOfMonth) {
                            res.status(400).send({
                                message: 'invalid date'
                            })
                        } else {
                            let sql, timeQuery = "1";
                            let invalidTimeFlag = false;
                            if (dayOfMonth === currentDayOfMonth && month === currentMonth && year === currentYear) {
                                let hours = currentDate.getHours();
                                let minutes = currentDate.getMinutes();
                                if (hours > 12) {
                                    if (time_type === "AM") {
                                        invalidTimeFlag = true;
                                    } else {
                                        timeQuery = "s.`time` >= TIME('" + hours + ":" + minutes + "') AND s.`time` <= TIME('23:59')";
                                    }
                                } else {
                                    if (time_type === "AM") {
                                        timeQuery = "s.`time` >= TIME('" + hours + ":" + minutes + "') AND s.`time` <= TIME('11:59')";
                                    } else {
                                        timeQuery = "s.`time` >= TIME('12:00') AND s.`time` <= TIME('23:59')";
                                    }
                                }
                            } else {
                                if (time_type === "AM") {
                                    timeQuery = "s.`time` >= TIME('00:00') AND s.`time` <= TIME('11:59')";
                                } else {
                                    timeQuery = "s.`time` >= TIME('12:00') AND s.`time` <= TIME('23:59')";
                                }
                            }

                            if (!invalidTimeFlag) {
                                async.waterfall([
                                    callback => {
                                        sql = "SELECT s.`id`, s.`time`, IF(ap.`id` IS NULL, 0, 1) AS `is_booked` FROM `slots` s LEFT JOIN `schedules` sch ON sch.`id` = s.`schedule_id` LEFT JOIN `appointments` ap ON s.`id` = ap.`slot_id` AND DATE(?) = ap.`date` WHERE s.`is_active` = 1 AND sch.`is_active` = 1 AND sch.`is_deleted` = 0 AND sch.`day` = ? AND " + timeQuery + " ORDER BY s.`time` ASC";
                                        connection.query(sql, [date, day + 1], (err, result) => {
                                            callback(err, result);
                                        })
                                    }
                                ], (err, slots) => {
                                    if (err) {
                                        res.status(400).send({
                                            message: 'some error occured'
                                        })
                                    } else {
                                        const data = [];
                                        if (slots && slots.length > 0) {
                                            slots.map(item => {
                                                data.push({
                                                    ...item,
                                                    time: timeFormatter(item.time),
                                                })
                                            })
                                        }
                                        res.status(200).send({
                                            message: 'slots fetched successfully',
                                            data: data
                                        })
                                    }
                                })
                            } else {
                                res.status(400).send({
                                    message: 'invalid time reference'
                                })
                            }
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
                    message: 'invalid date'
                })
            }
        } else {
            res.status(400).send({
                message: 'invalid time type'
            })
        }
    }
}