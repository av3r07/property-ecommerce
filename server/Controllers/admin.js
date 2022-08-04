const async = require('async');
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');
const bcrypt = require('bcrypt');
const connection = require('../db/database');
const passwordGenerator = require('generate-password');
const otpGenerator = require('otp-generator')
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

const sesConfig = {
    apiVersion: '2010-12-01',
    accessKeyId: 'AKIAWWBGVYDD4HAUI25I',
    secretAccessKey: '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',
    region: 'ap-south-1'
}

exports.adminLogin = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            email,
            password
        } = req.body;

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `id`, `service_ids`, `first_name`, `last_name`, `email`, `phone`, `password`, `image`, `role`, `is_active`  FROM `admins` WHERE `email` = ?";
                connection.query(sql, [email], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        if (result.length > 0) {
                            if (result[0].is_active === 1) {
                                callback(null, result[0])
                            } else {
                                res.status(401).send({
                                    message: 'your account has been deactivated'
                                })
                            }
                        } else {
                            res.status(400).send({
                                message: "User doesn't exist"
                            })
                        }
                    }
                })
            },
            (admin, callback) => {
                bcrypt.compare(password, admin.password, (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result) {
                            callback(null, admin)
                        } else {
                            res.status(401).send({
                                message: "wrong password"
                            })
                        }
                    }
                })
            },
            (admin, callback) => {
                delete admin["password"];
                jwt.sign({
                    data: {
                        id: admin.id,
                        role: admin.role
                    }
                }, '12345678', (err, token) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, token, admin)
                    }
                })
            },
            (token, admin, callback) => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [admin.id, admin.role], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0] && result[0]) {
                            callback(null, token, admin, result[0].tokens);
                        } else {
                            callback(null, token, admin, null)
                        }
                    }
                })
            },
            (token, admin, tokens, callback) => {
                if (tokens || tokens === "") {
                    const sessionTokens = tokens === "" ? [] : tokens.split(',');
                    if (sessionTokens[0] === "" && sessionTokens.length > 0) {
                        sessionTokens.splice(0, 1);
                    }
                    sessionTokens.push(token);
                    sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [sessionTokens.join(), admin.id, admin.role], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, admin);
                        }
                    })
                } else {
                    sql = "INSERT INTO `sessions` (`user_id`, `user_role`, `tokens`) VALUES (?,?,?)";
                    connection.query(sql, [admin.id, admin.role, token], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, admin);
                        }
                    })
                }
            }
        ], (err, token, admin) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occured'
                })
            } else {
                res.status(200).send({
                    message: 'admin logged in succesfully',
                    token: token,
                    data: admin
                })
            }
        })
    }
}

exports.adminChangePassword = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2 || admin.role === 3) {
            const {
                old_password,
                password
            } = req.body;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `password` FROM `admins` WHERE `id` = ?";
                    connection.query(sql, [admin.id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result[0].password)
                        }
                    })
                },
                (oldPassword, callback) => {
                    bcrypt.compare(old_password, oldPassword, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result) {
                                callback(null)
                            } else {
                                res.status(401).send({
                                    message: "wrong old password"
                                })
                            }
                        }
                    })
                },
                callback => {
                    bcrypt.hash(password, 10, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result);
                        }
                    })
                },
                (encryptedPassword, callback) => {
                    async.parallel([
                        cb => {
                            sql = "UPDATE `admins` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            connection.query(sql, [encryptedPassword, admin.id], (err, result) => {
                                if (err) {
                                    cb(err)
                                } else {
                                    cb(null)
                                }
                            })

                        },
                        cb => {
                            sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                            connection.query(sql, [req.headers.authorization, admin.id, admin.role], (err, result) => {
                                if (err) {
                                    cb(err)
                                } else {
                                    cb(null)
                                }
                            })
                        }
                    ], (err) => {
                        callback(err)
                    })
                }
            ], (err) => {
                if (err) {
                    res.status(400).send({
                        message: 'some error occured'
                    })
                } else {
                    res.status(200).send({
                        message: 'password updated successfully'
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

exports.adminLogout = (req, res) => {
    const admin = res.locals.user;
    const token = req.headers.authorization;
    if (admin.role === 1 || admin.role === 2 || admin.role === 3) {

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [admin.id, admin.role], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            callback(null, result[0].tokens);
                        } else {
                            res.status(400).send({
                                message: 'invalid request'
                            })
                        }
                    }
                })
            },
            (tokens, callback) => {
                const sessionTokens = tokens.split(',');
                if (sessionTokens[0] === "") {
                    sessionTokens.splice(0, 1);
                }
                const index = sessionTokens.indexOf(token);
                sessionTokens.splice(index, 1);
                let tokensValue = "";
                if (sessionTokens.length > 0) {
                    if (sessionTokens.length === 1) {
                        tokensValue = sessionTokens[0];
                    } else {
                        tokensValue = sessionTokens.join();
                    }
                }
                sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [tokensValue, admin.id, admin.role], (err, result) => {
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
                    message: 'admin logged out successfully'
                })
            }
        })
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.fetchAdminDetails = (req, res) => {
    res.status(200).send({
        message: 'user details fetched successfully',
        data: ((res.locals.user.role === 1 || res.locals.user.role === 2 || res.locals.user.role === 3) ? res.locals.user : null)
    })
}




exports.addSuperAdmin = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role && admin.role === 1) {
            const {
                first_name,
                last_name,
                email,
                phone
            } = req.body;

            async.waterfall([
                callback => {
                    let password = passwordGenerator.generate({
                        length: 16,
                        uppercase: true,
                        numbers: true,
                        symbols: true
                    });
                    callback(null, password)
                },
                (password, callback) => {
                    bcrypt.hash(password, 10, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result);
                        }
                    })
                },
                (encryptedPassword, callback) => {
                    let sql = "INSERT INTO `admins` (`first_name`, `last_name`, `email`, `phone`,`password`, `role`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?, NOW(), NOW())";
                    connection.query(sql, [first_name, last_name, email, phone, encryptedPassword, 2], (err, result) => {
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
                            message: 'admin already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "super admin created successfully"
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

exports.addAdmin = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const service_ids = req.body.service_ids;
        if (service_ids === '1' || service_ids === '1,2' || service_ids === '2' || service_ids === '2,1') {
            const admin = res.locals.user;
            if (admin.role && (admin.role === 1 || admin.role === 2)) {
                const {
                    first_name,
                    last_name,
                    email,
                    phone
                } = req.body;

                let sql;
                async.waterfall([
                    callback => {
                        let password = passwordGenerator.generate({
                            length: 16,
                            uppercase: true,
                            numbers: true,
                            symbols: true
                        });
                        callback(null, password)
                    },
                    (password, callback) => {
                        bcrypt.hash(password, 10, (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null, result);
                            }
                        })
                    },
                    (encryptedPassword, callback) => {
                        sql = "INSERT INTO `admins` (`first_name`, `last_name`, `email`, `phone`, `service_ids`,`password`, `role`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?, NOW(), NOW())";
                        connection.query(sql, [first_name, last_name, email, phone, service_ids, encryptedPassword, 3], (err, result) => {
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
                                message: 'admin already exists'
                            })
                        } else {
                            res.status(400).send({
                                message: 'some error occured'
                            })
                        }
                    } else {
                        res.status(200).send({
                            message: "admin created successfully"
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
                message: 'invalid service selected'
            })
        }
    }
}

exports.adminForgotPassword = (req, res) => {
    const email = req.body.email || "";
    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active` FROM `admins` WHERE `email` = ?";
            connection.query(sql, [email], (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    if (result && result[0]) {
                        if (result[0].is_active === 1) {
                            callback(null)
                        } else {
                            res.status(400).send({
                                message: 'your account has been deactivated'
                            })
                        }
                    } else {
                        res.status(400).send({
                            message: 'admin with this email does not exist'
                        })
                    }
                }
            })
        },
        callback => {
            const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, });

            const params = {
                Source: 'ravi.soni@techconfer.in',
                Destination: {
                    ToAddresses: [email]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: "<p>Your <b>one time password<b> to reset your password is <br/><h3 style = 'font-size: 32px; font-weight:700; color: #000; padding: 4px 8px; width :max-content; text-align : center; background-color : #fff;'>" + otp + "</h3>"
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Test email'
                    }
                }
            }

            new aws.SES(sesConfig).sendEmail(params).promise().then(result => callback(null, otp)).catch(err => callback(err))
        }
    ], (err, otp) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            res.status(200).send({
                message: 'otp sent successfully',
                data: {
                    otp: otp
                }
            })
        }
    })
}

exports.adminResetPassword = (req, res) => {
    const {
        email,
        password
    } = req.body;


    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active`, `role` FROM `admins` WHERE `email` = ?";
            connection.query(sql, [email], (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    if (result && result[0]) {
                        if (result[0].is_active === 1) {
                            callback(null, result[0])
                        } else {
                            res.status(400).send({
                                message: 'your account has been deactivated'
                            })
                        }
                    } else {
                        res.status(400).send({
                            message: 'admin with this email does not exist'
                        })
                    }
                }
            })
        },
        (adminData, callback) => {
            bcrypt.hash(password, 10, (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, adminData, result);
                }
            })
        },
        (adminData, encryptedPassword, callback) => {
            async.parallel([
                cb => {
                    sql = "UPDATE `admins` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [encryptedPassword, adminData.id], (err, result) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })

                },
                cb => {
                    sql = "UPDATE `sessions` SET `tokens` = '' WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [adminData.id, adminData.role], (err, result) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }
            ], (err) => {
                callback(err)
            })
        }
    ], (err) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            res.status(200).send({
                message: 'password reset successfully'
            })
        }
    })


}

exports.editAdmin = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            first_name,
            last_name,
            phone
        } = req.body;

        const { id } = res.locals.user;

        async.waterfall([
            callback => {
                let image = "";
                if (typeof req.body.image === 'string') {
                    image = req.body.image;
                }
                if (req.file) {
                    image = req.file.filename;
                }
                let sql = "UPDATE `admins` SET `first_name` = ?, `last_name` = ?, `phone` = ?, `image` = ?, `updated_at` = NOW() WHERE `id` = ?";
                connection.query(sql, [first_name, last_name, phone, image, id], (err, result) => {
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
                    message: 'details updated successfully'
                })
            }
        })
    }
}

exports.editAdminById = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            first_name,
            last_name,
            phone,
            email
        } = req.body;

        const id = req.params.id;

        const admin = res.locals.user;

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `role`, `is_active`, `service_ids` FROM `admins` WHERE id = ?";
                connection.query(sql, [id], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result.length > 0) {
                            callback(null, result[0])
                        } else {
                            res.status(400).send({
                                message: 'admin not found'
                            })
                        }
                    }
                })
            },
            (adminData, callback) => {
                if (adminData.is_active === 1) {
                    if (adminData.role !== 1 && (admin.role === 1 || admin.role === 2)) {
                        if (adminData.role === 3) {
                            const service_ids = req.body.service_ids || "";
                            if (service_ids === '1' || service_ids === '1,2' || service_ids === '2' || service_ids === '2,1') {
                                async.parallel([
                                    cb => {
                                        sql = "UPDATE `admins` SET `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `service_ids`= ?, `updated_at` = NOW() WHERE `id` = ?";
                                        connection.query(sql, [first_name, last_name, email, phone, service_ids, id], (err, result) => {
                                            if (err) {
                                                cb(err)
                                            } else {
                                                cb(null)
                                            }
                                        })
                                    },
                                    cb => {
                                        if (adminData.service_ids.split(',').indexOf('1') !== -1 && service_ids.split(',').indexOf('1') === -1) {
                                            sql = "UPDATE `properties` SET `admin_id` = ? WHERE `admin_id` = ?";
                                            connection.query(sql, [null, id], (err, result) => {
                                                cb(null)
                                            })
                                        } else {
                                            cb(null)
                                        }
                                    }
                                ], (err) => {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        callback(null)
                                    }
                                })
                            } else {
                                res.status(400).send({
                                    message: 'invalid service selected'
                                })
                            }
                        } else {
                            sql = "UPDATE `admins` SET `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            connection.query(sql, [first_name, last_name, email, phone, id], (err, result) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback(null)
                                }
                            })
                        }
                    } else {
                        res.status(403).send({
                            message: 'not authorized'
                        })
                    }
                } else {
                    res.status(403).send({
                        message: 'account has been deactivated'
                    })
                }
            }
        ], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(400).send({
                        message: 'admin with this phone number or email already exists'
                    })
                } else {
                    res.status(400).send({
                        message: 'some error occured'
                    })
                }
            } else {
                res.status(200).send({
                    message: 'details updated successfully'
                })
            }
        })
    }
}


exports.fetchAdmins = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const search = req.body.search || "";
            const request_type = parseInt(req.body.request_type) || 0  // 1 --> active, 2--> not active, 0 --> all
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const service_id = parseInt(req.body.service_id) || "" // 0 --> all, 1 --> realestate, 2 --> financial
            let sql, requestTypeQuery, serviceQuery;
            const searchQuery = "(`first_name` LIKE '" + search + "%' OR  `last_name` LIKE '" + search + "%' OR `email` LIKE '" + search + "%')";
            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            if (service_id) {
                serviceQuery = "FIND_IN_SET('" + service_id + "', `service_ids`)";
            } else {
                serviceQuery = "1"
            }

            async.parallel([
                callback => {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `service_ids`, `is_active`, `created_at`, `updated_at` FROM `admins` WHERE `role` = 3 AND " + searchQuery + " AND " + requestTypeQuery + " AND " + serviceQuery + " ORDER BY `updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_admins` FROM `admins` WHERE `role` = 3 AND " + searchQuery + " AND " + requestTypeQuery + " AND " + serviceQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result[0] && result[0].total_admins) {
                                callback(null, result[0].total_admins)
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
                        message: 'admins list fetched successfully',
                        data: {
                            admins: data,
                            total_admins: results[1] || 0
                        }
                    })
                }
            })
        } else {
            res.status(403).send({
                message: "not authorized"
            })
        }
    }
}

exports.fetchSuperAdmins = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1) {
            const search = req.body.search || "";
            const request_type = parseInt(req.body.request_type) || 0  // 1 --> active, 2--> not active, 0 --> all
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            let sql, requestTypeQuery;
            const searchQuery = "(`first_name` LIKE '" + search + "%' OR  `last_name` LIKE '" + search + "%' OR `email` LIKE '" + search + "%')";
            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0"
            } else {
                requestTypeQuery = "1"
            }

            async.parallel([
                callback => {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `is_active`, `created_at`, `updated_at` FROM `admins` WHERE `role` = 2 AND " + searchQuery + " AND " + requestTypeQuery + " ORDER BY `updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS total_super_admins FROM `admins` WHERE `role` = 2 AND " + searchQuery + " AND " + requestTypeQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result[0] && result[0].total_super_admins) {
                                callback(null, result[0].total_super_admins)
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
                        message: 'super admins list fetched successfully',
                        data: {
                            super_admins: data,
                            total_super_admins: results[1] || 0
                        }
                    })
                }
            })
        } else {
            res.status(403).send({
                message: "not authorized"
            })
        }
    }
}

exports.activateDeactivateAdmin = (req, res) => {
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
                        sql = "SELECT `is_active`, `role`, `service_ids` FROM `admins` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].role === 1) {
                                        res.status(403).send({
                                            message: 'not authorized'
                                        })
                                    } else {
                                        if (result[0].role === 2) {
                                            if (admin.role === 1) {
                                                if (request_type === result[0].is_active) {
                                                    res.status(400).send({
                                                        message: (request_type === 1 ? "admin has already been activated" : "admin has already been deactivated")
                                                    })
                                                } else {
                                                    callback(null, result[0])
                                                }
                                            } else {
                                                res.status(403).send({
                                                    message: 'not authorized'
                                                })
                                            }
                                        } else if (result[0].role === 3) {
                                            if (admin.role < result[0].role) {
                                                if (request_type === result[0].is_active) {
                                                    res.status(400).send({
                                                        message: (request_type === 1 ? "admin has already been activated" : "admin has already been deactivated")
                                                    })
                                                } else {
                                                    callback(null, result[0])
                                                }
                                            } else {
                                                res.status(403).send({
                                                    message: 'not authorized'
                                                })
                                            }
                                        } else {
                                            res.status(400).send({
                                                message: 'invalid request'
                                            })
                                        }
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'admin not found'
                                    })
                                }
                            }
                        })
                    },
                    (user, callback) => {
                        sql = "UPDATE `admins` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
                        connection.query(sql, [request_type, id], (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null, user)
                            }
                        })
                    },
                    (user, callback) => {
                        if (request_type === 0) {
                            if (user.role === 3) {
                                if (user.service_ids.split(',').indexOf('1') !== -1) {
                                    sql = "UPDATE `properties` SET `admin_id` = ? WHERE `admin_id` = ?";
                                    connection.query(sql, [null, id], (err, result) => {
                                        callback(null)
                                    })
                                } else {
                                    callback(null)
                                }
                            } else {
                                callback(null)
                            }
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
                            message: (request_type === 1 ? "admin activated successfully" : "admin deactivated successfully")
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


exports.dashboard = (req, res) => {
    const admin = res.locals.user;
    if (admin.role === 1 || admin.role === 2 || admin.role === 3) {
        let sql;
        async.parallel([
            callback => {
                callback(null, 100);
            },
            callback => {
                callback(null, 1000)
            },
            callback => {
                sql = "SELECT COUNT(`id`) AS `total_appointments` FROM `appointments`";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT COUNT(`id`) AS `total_enquiries` FROM `enquiries`";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT COUNT(`id`) AS `total_properties` FROM `properties`";
                connection.query(sql, [], (err, result) => {
                    callback(err, result)
                })
            },
            callback => {
                sql = "SELECT COUNT(`id`) AS `total_financial_plans` FROM `financial_plans`";
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
                res.status(200).send({
                    message: "dashboard data fetched successfully",
                    data: {
                        total_visits: results[0],
                        total_payment: results[1],
                        total_appointments: results[2][0].total_appointments || 0,
                        total_enquiries: results[3][0].total_enquiries || 0,
                        total_properties: results[4][0].total_properties || 0,
                        total_financial_plans: results[5][0].total_financial_plans || 0
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