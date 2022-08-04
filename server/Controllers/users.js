const async = require('async');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require('../db/database');
const aws = require('aws-sdk');
const otpGenerator = require('otp-generator')
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

const sesConfig = {
    apiVersion: '2010-12-01',
    accessKeyId: 'AKIAWWBGVYDD4HAUI25I',
    secretAccessKey: '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',
    region: 'ap-south-1'
}

exports.userSignup = (req, res) => {
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
            email,
            phone,
            password
        } = req.body;

        async.waterfall([
            callback => {
                bcrypt.hash(password, 10, (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                })
            },
            (encryptedPassword, callback) => {
                let sql = "INSERT INTO `users` (`first_name`, `last_name`, `email`, `phone`, `password`, `role`, `updated_at`,`created_at`) VALUES (?,?,?,?,?,5,NOW(),NOW())";
                connection.query(sql, [first_name, last_name, email, phone, encryptedPassword], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, encryptedPassword);
                    }
                })
            },
            (encryptedPassword, callback) => {
                const verificationLink = `http://83.136.219.147:8000/users/verification?email=${email}&key=${encryptedPassword}`
                const params = {
                    Source: 'ravi.soni@techconfer.in',
                    Destination: {
                        ToAddresses: [email]
                    },
                    Message: {
                        Body: {
                            Html: {
                                Charset: "UTF-8",
                                Data: "<p>Your <b>one time password<b> to reset your password is <br/><a href ='" + verificationLink + "'  style = 'font-size: 32px; font-weight:700; color: #000; padding: 4px 8px; width :max-content; text-align : center; background-color : #fff;'>Verify Account</a>"
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: 'Test email'
                        }
                    }
                }
                new aws.SES(sesConfig).sendEmail(params).promise().then(result => callback(null)).catch(err => callback(null))
            }
        ], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.status(400).send({
                        message: 'user already exists'
                    })
                } else {
                    res.status(400).send({
                        message: 'Error while registration'
                    });
                }
            } else {
                res.status(200).send({
                    message: 'user successfully registerd'
                });
            }
        })
    }
}

exports.userLogin = (req, res) => {
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
        async.waterfall([
            callback => {
                let sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `password`, `image`, `role`, `is_verified`, `is_active` FROM `users` WHERE `email` = ?";
                connection.query(sql, [email], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        if (result.length > 0) {
                            if (result[0].is_active === 1 && result[0].is_verified === 1) {
                                callback(null, result[0])
                            } else {
                                if (result[0].is_verified === 0 && result[0].is_active === 1) {
                                    const verificationLink = `http://83.136.219.147:8000/users/verification?email=${email}&key=${result[0].password}`
                                    const params = {
                                        Source: 'ravi.soni@techconfer.in',
                                        Destination: {
                                            ToAddresses: [email]
                                        },
                                        Message: {
                                            Body: {
                                                Html: {
                                                    Charset: "UTF-8",
                                                    Data: "<p>Your <b>one time password<b> to reset your password is <br/><a href ='" + verificationLink + "'  style = 'font-size: 32px; font-weight:700; color: #000; padding: 4px 8px; width :max-content; text-align : center; background-color : #fff;'>Verify Account</a>"
                                                }
                                            },
                                            Subject: {
                                                Charset: 'UTF-8',
                                                Data: 'Test email'
                                            }
                                        }
                                    }
                                    new aws.SES(sesConfig).sendEmail(params).promise();
                                }
                                res.status(401).send({
                                    message: (result[0].is_verified === 0 ? 'your account is not verified. Please verify your account.' : 'your account has been deactivated')
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
            (user, callback) => {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result) {
                            callback(null, user)
                        } else {
                            res.status(401).send({
                                message: 'wrong password'
                            })
                        }
                    }
                })
            },
            (user, callback) => {
                delete user["password"];
                jwt.sign({
                    data: {
                        id: user.id,
                        role: user.role
                    }
                }, '12345678', (err, token) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, token, user)
                    }
                });
            },
            (token, user, callback) => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [user.id, user.role], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0] && result[0]) {
                            callback(null, token, user, result[0].tokens);
                        } else {
                            callback(null, token, user, null)
                        }
                    }
                })
            },
            (token, user, tokens, callback) => {
                if (tokens || tokens === "") {
                    const sessionTokens = tokens === "" ? [] : tokens.split(',');
                    if (sessionTokens[0] === "" && sessionTokens.length > 0) {
                        sessionTokens.splice(0, 1);
                    }
                    sessionTokens.push(token);
                    sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [sessionTokens.join(), user.id, user.role], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, user);
                        }
                    })
                } else {
                    sql = "INSERT INTO `sessions` (`user_id`, `user_role`, `tokens`) VALUES (?,?,?)";
                    connection.query(sql, [user.id, user.role, token], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, user);
                        }
                    })
                }
            }
        ], (err, token, user) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occured'
                })
            } else {
                res.status(200).send({
                    message: 'user logged in succesfully',
                    token: token,
                    data: user
                })
            }
        })
    }
}

exports.sendUserVerificationMail = (req, res) => {
    const email = req.body.email;
    async.waterfall([
        callback => {
            let sql = "SELECT `password`, `is_verified`, `is_active` FROM `users` WHERE `email` = ?";
            connection.query(sql, [email], (err, result) => {
                if (err) {
                    callback(err);
                } else {
                    if (result && result.length > 0) {
                        if (result[0].is_active === 0) {
                            res.status(401).send({
                                message: 'account has been deactivated',
                            })
                        } else {
                            if (result[0].is_verified === 0) {
                                const verificationLink = `http://83.136.219.147:8000/users/verification?email=${email}&key=${result[0].password}`
                                const params = {
                                    Source: 'ravi.soni@techconfer.in',
                                    Destination: {
                                        ToAddresses: [email]
                                    },
                                    Message: {
                                        Body: {
                                            Html: {
                                                Charset: "UTF-8",
                                                Data: "<p>Your <b>one time password<b> to reset your password is <br/><a href ='" + verificationLink + "'  style = 'font-size: 32px; font-weight:700; color: #000; padding: 4px 8px; width :max-content; text-align : center; background-color : #fff;'>Verify Account</a>"
                                            }
                                        },
                                        Subject: {
                                            Charset: 'UTF-8',
                                            Data: 'Test email'
                                        }
                                    }
                                }
                                new aws.SES(sesConfig).sendEmail(params).promise().then(result => callback(null)).catch(err => callback(null))
                            }
                            else {
                                res.status(400).send({
                                    message: "acccount already verified"
                                })
                            }
                        }
                    } else {
                        res.status(400).send({
                            message: "User doesn't exist"
                        })
                    }
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
                message: 'eamil sent'
            })
        }
    })
}

exports.userVerification = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            email,
            key
        } = req.body;

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `is_active`, `password`, `is_verified` FROM `users` WHERE `email` = ?";
                connection.query(sql, [email, key], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            if (result[0].is_active === 1) {
                                if (result[0].is_verified === 1) {
                                    res.status(401).send({
                                        message: 'your account is already verified'
                                    })
                                } else {
                                    if (result[0].password === key) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: 'invalid access key'
                                        })
                                    }
                                }
                            } else {
                                res.send(401).send({
                                    message: 'your account has been deactivated'
                                })
                            }
                        } else {
                            res.status(400).send({
                                message: 'no user found'
                            })
                        }
                    }
                })
            },
            callback => {
                sql = "UPDATE `users` SET `is_verified` = 1, `updated_at` = NOW() WHERE `email` = ?";
                connection.query(sql, [email], (err, result) => {
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
                    message: 'Your account has verified'
                })
            }
        })
    }
}

exports.userChangePassword = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const user = res.locals.user;
        if (user.role === 5) {
            const {
                old_password,
                password
            } = req.body;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `password` FROM `users` WHERE `id` = ?";
                    connection.query(sql, [user.id], (err, result) => {
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
                            sql = "UPDATE `users` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            connection.query(sql, [encryptedPassword, user.id], (err, result) => {
                                if (err) {
                                    cb(err)
                                } else {
                                    cb(null)
                                }
                            })

                        },
                        cb => {
                            sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                            connection.query(sql, [req.headers.authorization, user.id, user.role], (err, result) => {
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

exports.userLogout = (req, res) => {
    const user = res.locals.user;
    const token = req.headers.authorization;
    if (user.role === 5) {

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [user.id, user.role], (err, result) => {
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
                connection.query(sql, [tokensValue, user.id, user.role], (err, result) => {
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
                    message: 'user logged out successfully'
                })
            }
        })
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.userForgotPassword = (req, res) => {
    const email = req.body.email || "";
    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active` FROM `users` WHERE `email` = ?";
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
                            message: 'user with this email does not exist'
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

exports.userResetPassword = (req, res) => {
    const {
        email,
        password
    } = req.body;


    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active`, `role` FROM `users` WHERE `email` = ?";
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
                            message: 'user with this email does not exist'
                        })
                    }
                }
            })
        },
        (userData, callback) => {
            bcrypt.hash(password, 10, (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, userData, result);
                }
            })
        },
        (userData, encryptedPassword, callback) => {
            async.parallel([
                cb => {
                    sql = "UPDATE `users` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [encryptedPassword, userData.id], (err, result) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })

                },
                cb => {
                    sql = "UPDATE `sessions` SET `tokens` = '' WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [userData.id, userData.role], (err, result) => {
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

exports.fetchUserDetails = (req, res) => {
    res.status(200).send({
        message: 'user details fetched successfully',
        data: (res.locals.user.role === 5 ? res.locals.user : null)
    })
}

exports.uploadUserProfilePicture = (req, res) => {
    if (req.file) {
        const user = res.locals.user;
        async.waterfall([
            callback => {
                let sql = "UPDATE `users` SET `image` = ?, `updated_at` = NOW() WHERE `id` = ?";
                connection.query(sql, [req.file.filename, user.id], (err, result) => {
                    callback(err)
                })
            }
        ], (err) => {
            if (err) {
                if (fs.existsSync(`./Uploads/${req.file.filename}`)) {
                    fs.unlinkSync(`./Uploads/${req.file.filename}`);
                }
                res.status(400).send({
                    message: 'some error occured'
                })
            } else {
                if (req.file && user.image && fs.existsSync(`./Uploads/${user.image}`)) {
                    fs.unlinkSync(`./Uploads/${user.image}`);
                }
                res.status(200).send({
                    message: "profile picture updated successfully"
                })
            }
        })
    } else {
        res.status(400).send({
            message: 'image is required'
        })
    }
}

exports.removeUserProfilePicture = (req, res) => {
    const user = res.locals.user;
    async.waterfall([
        callback => {
            let sql = "UPDATE `users` SET `image` = '', `updated_at` = NOW() WHERE `id` = ?";
            connection.query(sql, [user.id], (err, result) => {
                callback(err)
            })
        }
    ], (err) => {
        if (err) {
            res.status(400).send({
                message: 'some error occured'
            })
        } else {
            if (user.image && fs.existsSync(`./Uploads/${user.image}`)) {
                fs.unlinkSync(`./Uploads/${user.image}`);
            }
            res.status(200).send({
                message: "profile picture removed successfully"
            })
        }
    })
}

exports.fetchUsers = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2 || admin.role === 3) {
            const request_type = parseInt(req.body.request_type) || 0;
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";
            const searchQuery = "(`first_name` LIKE '" + search + "%' OR `last_name` LIKE '" + search + "%' OR `email` LIKE '" + search + "%')";
            let sql, requestTypeQuery = 1;
            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0";
            }
            async.parallel([
                callback => {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `is_active`, `updated_at`, `created_at` FROM `users` WHERE " + requestTypeQuery + " AND " + searchQuery + " ORDER BY `updated_at` LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        callback(err, result)
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS `total_users` FROM `users` WHERE " + requestTypeQuery + " AND " + searchQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                callback(null, result[0].total_users)
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
                        message: 'users fetched successfully',
                        data: {
                            users: data,
                            total_users: results[1] || 0
                        }
                    })
                }
            })
        } else {
            req.status(403).send({
                message: 'not authorized'
            })
        }
    }
}


exports.activateDeactivateUser = (req, res) => {
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
                        sql = "SELECT `is_active` FROM `users` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err);
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active != request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type == 1 ? 'user has already been activated' : 'user has already been deactivated')
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'no user found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `users` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type == 1 ? 'user activated successfully' : 'user deactivated successfully')
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

exports.addUserDocs = (req, res) => {
    const user = res.locals.user;
    if (user.role === 5) {
        if (req.file && req.file.filename) {
            async.waterfall([
                callback => {
                    const sql = "INSERT INTO `user_docs` (`name`,`user_id`, `created_at`, `updated_at`) VALUES (?,?,NOW(),NOW())";
                    connection.query(sql, [req.file.filename, user.id], (err, result) => {
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
                        message: 'document uploaded successfully'
                    })
                }
            })
        } else {
            res.status(400).send({
                message: 'document is required'
            })
        }
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.deleteUserDoc = (req, res) => {
    const user = res.locals.user;
    if (user.role === 5) {
        const id = parseInt(req.params.id) || 0;
        if (id) {
            let sql;
            async.waterfall([
                callback => {
                    sql = "SELECT `user_id`, `is_deleted` FROM `user_docs` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result && result[0]) {
                                if (result[0].user_id === user.id) {
                                    if (result[0].is_deleted === 0) {
                                        callback(null)
                                    } else {
                                        res.status(400).send({
                                            message: "document already deleted"
                                        })
                                    }
                                } else {
                                    res.status(403).send({
                                        message: "not authorized"
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: "document not found"
                                })
                            }
                        }
                    })
                },
                callback => {
                    sql = "UPDATE `user_docs` SET `is_deleted` = 1, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
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
                        message: 'document deleted successfully'
                    })
                }
            })
        } else {
            res.status(400).send({
                message: 'invalid id'
            })
        }
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.fetchUserDocs = (req, res) => {
    const user = res.locals.user;

    if (user.role === 5) {
        async.waterfall([
            callback => {
                const sql = "SELECT `id`, `name`, `created_at` FROM `user_docs` WHERE `is_deleted` = 0 AND `user_id` = ?";
                connection.query(sql, [user.id], (err, result) => {
                    callback(err, result);
                })
            }
        ], (err, result) => {
            if (err) {
                res.status(400).send({
                    message: "some error occured"
                })
            } else {
                res.status(200).send({
                    message: 'documents fetched successfully',
                    data: result || []
                })
            }
        })
    } else {
        req.status(403).send({
            message: 'not authorized'
        })
    }
}
