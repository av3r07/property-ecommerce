const async = require('async');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const aws = require('aws-sdk');
const otpGenerator = require('otp-generator')
const connection = require('../db/database');
const passwordGenerator = require('generate-password');
const { validationResult } = require('express-validator');
const { getDateTimeInTimezone } = require('../Utils/commonFunctions');

const sesConfig = {
    apiVersion: '2010-12-01',
    accessKeyId: 'AKIAWWBGVYDD4HAUI25I',
    secretAccessKey: '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',
    region: 'ap-south-1'
}

exports.serviceProviderLogin = (req, res) => {
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
                sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `password`, `image`, `role`, `is_verified`, `is_active`  FROM `service_providers` WHERE `email` = ?";
                connection.query(sql, [email], (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        if (result.length > 0) {
                            if (result[0].is_active === 1 && result[0].is_verified === 0) {
                                res.status(401).send({
                                    message: 'Please verify your account. Please check your email.'
                                })
                            } else if (result[0].is_active === 1 && result[0].is_approved === 0) {
                                res.status(401).send({
                                    message: 'your account has not been approved yet'
                                })
                            } else {
                                if (result[0].is_active === 1) {
                                    callback(null, result[0])
                                } else {
                                    res.status(401).send({
                                        message: 'your account has been deactivated'
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
            },
            (serviceProvider, callback) => {
                bcrypt.compare(password, serviceProvider.password, (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result) {
                            callback(null, serviceProvider)
                        } else {
                            res.status(401).send({
                                message: "wrong password"
                            })
                        }
                    }
                })
            },
            (serviceProvider, callback) => {
                delete serviceProvider["password"];
                jwt.sign({
                    data: {
                        id: serviceProvider.id,
                        role: serviceProvider.role
                    }
                }, '12345678', (err, token) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, token, serviceProvider)
                    }
                });
            },
            (token, serviceProvider, callback) => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [serviceProvider.id, serviceProvider.role], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0] && result[0]) {
                            callback(null, token, serviceProvider, result[0].tokens);
                        } else {
                            callback(null, token, serviceProvider, null)
                        }
                    }
                })
            },
            (token, serviceProvider, tokens, callback) => {
                if (tokens || tokens === "") {
                    const sessionTokens = tokens === "" ? [] : tokens.split(',');
                    if (sessionTokens[0] === "" && sessionTokens.length > 0) {
                        sessionTokens.splice(0, 1);
                    }
                    sessionTokens.push(token);
                    sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [sessionTokens.join(), serviceProvider.id, serviceProvider.role], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, serviceProvider);
                        }
                    })
                } else {
                    sql = "INSERT INTO `sessions` (`user_id`, `user_role`, `tokens`) VALUES (?,?,?)";
                    connection.query(sql, [serviceProvider.id, serviceProvider.role, token], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, token, serviceProvider);
                        }
                    })
                }
            }
        ], (err, token, serviceProvider) => {
            if (err) {
                res.status(400).send({
                    message: 'some error occured'
                })
            } else {
                res.status(200).send({
                    message: 'service provider logged in succesfully',
                    token: token,
                    data: serviceProvider
                })
            }
        })
    }
}

exports.serviceProviderChangePassword = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const serviceProvider = res.locals.user;
        if (serviceProvider.role === 4) {
            const {
                old_password,
                password
            } = req.body;

            let sql;

            async.waterfall([
                callback => {
                    sql = "SELECT `password` FROM `service_providers` WHERE `id` = ?";
                    connection.query(sql, [serviceProvider.id], (err, result) => {
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
                            sql = "UPDATE `service_providers` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                            connection.query(sql, [encryptedPassword, serviceProvider.id], (err, result) => {
                                if (err) {
                                    cb(err)
                                } else {
                                    cb(null)
                                }
                            })

                        },
                        cb => {
                            sql = "UPDATE `sessions` SET `tokens` = ? WHERE `user_id` = ? AND `user_role` = ?";
                            connection.query(sql, [req.headers.authorization, serviceProvider.id, serviceProvider.role], (err, result) => {
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

exports.serviceProviderForgotPassword = (req, res) => {
    const email = req.body.email || "";
    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active`, `is_verified` FROM `service_providers` WHERE `email` = ?";
            connection.query(sql, [email], (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    if (result && result[0]) {
                        if (result[0].is_active === 1) {
                            if (result[0].is_verified === 0) {
                                res.status(400).send({
                                    message: 'please verify your email. a verification email has already been sent'
                                })
                            } else {
                                callback(null)
                            }
                        } else {
                            res.status(400).send({
                                message: 'your account has been deactivated'
                            })
                        }
                    } else {
                        res.status(400).send({
                            message: 'service provider with this email does not exist'
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

exports.serviceProviderResetPassword = (req, res) => {
    const {
        email,
        password
    } = req.body;


    let sql;
    async.waterfall([
        callback => {
            sql = "SELECT `id`, `is_active`, `role` FROM `service_providers` WHERE `email` = ?";
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
                            message: 'service provider with this email does not exist'
                        })
                    }
                }
            })
        },
        (serviceProviderData, callback) => {
            bcrypt.hash(password, 10, (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, serviceProviderData, result);
                }
            })
        },
        (serviceProviderData, encryptedPassword, callback) => {
            async.parallel([
                cb => {
                    sql = "UPDATE `service_providers` SET `password` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [encryptedPassword, serviceProviderData.id], (err, result) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })

                },
                cb => {
                    sql = "UPDATE `sessions` SET `tokens` = '' WHERE `user_id` = ? AND `user_role` = ?";
                    connection.query(sql, [serviceProviderData.id, serviceProviderData.role], (err, result) => {
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

exports.serviceProviderLogout = (req, res) => {
    const serviceProvider = res.locals.user;
    const token = req.headers.authorization;
    if (serviceProvider.role === 4) {

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `tokens` FROM `sessions` WHERE `user_id` = ? AND `user_role` = ?";
                connection.query(sql, [serviceProvider.id, serviceProvider.role], (err, result) => {
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
                connection.query(sql, [tokensValue, serviceProvider.id, serviceProvider.role], (err, result) => {
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
                    message: 'service provider logged out successfully'
                })
            }
        })
    } else {
        res.status(403).send({
            message: 'not authorized'
        })
    }
}

exports.addServiceProvider = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        let admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const {
                first_name,
                last_name,
                email,
                phone,
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
                    sql = "INSERT INTO `service_providers` (`first_name`, `last_name`, `email`, `password`, `phone`, `role`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?, NOW(), NOW())";
                    connection.query(sql, [first_name, last_name, email, encryptedPassword, phone, 4,], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, encryptedPassword)
                        }
                    })
                },
                (encryptedPassword, callback) => {
                    const verificationLink = `http://83.136.219.147:8000/serviceProvider/verification?email=${email}&key=${encryptedPassword}`
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
                            message: 'service provider already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'service provider added successfully'
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

exports.sendServiceProviderVerificationMail = (req, res) => {
    const email = req.body.email;
    async.waterfall([
        callback => {
            let sql = "SELECT `password`, `is_verified`, `is_active` FROM `service_providers` WHERE `email` = ?";
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
                                const verificationLink = `http://83.136.219.147:8000/serviceProvider/verification?email=${email}&key=${result[0].password}`
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

exports.editServiceProvider = (req, res) => {
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
        } = req.body;

        let image = "";
        if (typeof req.body.image === 'string') {
            image = req.body.image;
        }
        if (req.file) {
            image = req.file.filename;
        }
        const { id, role } = res.locals.user;

        if (role === 4) {
            async.waterfall([
                callback => {
                    let sql = "UPDATE `service_providers` SET `first_name` = ?, `last_name` = ?, `phone` = ?, `image` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).send({
                            message: 'service provider with this phone number already exists'
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
        } else {
            res.status(403).send({
                message: 'not authorized'
            })
        }
    }
}

exports.editServiceProviderById = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {

        const id = req.params.id;

        const admin = res.locals.user;

        const {
            first_name,
            last_name,
            phone,
            email,
        } = req.body;

        let sql;

        if (admin.role === 1 || admin.role === 2) {
            async.waterfall([
                callback => {
                    sql = "SELECT `is_active` FROM `service_providers` WHERE `id` = ?";
                    connection.query(sql, [id], (err, result) => {
                        if (err) {
                            callback(err);
                        } else {
                            if (result && result.length > 0) {
                                if (result[0].is_active === 1) {
                                    callback(null)
                                } else {
                                    res.status(403).send({
                                        message: 'service provider account has been deactivated'
                                    })
                                }
                            } else {
                                res.status(400).send({
                                    message: 'no service provider found'
                                })
                            }
                        }
                    })
                },
                callback => {
                    sql = "UPDATE `service_providers` SET `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `updated_at` = NOW() WHERE `id` = ?";
                    connection.query(sql, [first_name, last_name, email, phone, id], (err, result) => {
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
                            message: 'service provider with this phone number or email already exists'
                        })
                    } else {
                        res.status(400).send({
                            message: 'some error occured'
                        })
                    }
                } else {
                    res.status(200).send({
                        message: 'service provider details updated successfully'
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

exports.activateDeactivateServiceProvider = (req, res) => {
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
                        sql = "SELECT `is_active` FROM `service_providers` WHERE `id` = ?";
                        connection.query(sql, [id], (err, result) => {
                            if (err) {
                                callback(err);
                            } else {
                                if (result && result.length > 0) {
                                    if (result[0].is_active != request_type) {
                                        callback(null)
                                    } else {
                                        res.status(403).send({
                                            message: (request_type == 1 ? 'service provider account has already been activated' : 'service provider account has already been deactivated')
                                        })
                                    }
                                } else {
                                    res.status(400).send({
                                        message: 'no service provider found'
                                    })
                                }
                            }
                        })
                    },
                    callback => {
                        sql = "UPDATE `service_providers` SET `is_active` = ?, `updated_at` = NOW() WHERE `id` = ?";
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
                            message: (request_type == 1 ? 'service provider account activated successfully' : 'service provider account deactivated successfully')
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

exports.serviceProviderVerification = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const {
            email,
            key,
            password
        } = req.body;

        let sql;

        async.waterfall([
            callback => {
                sql = "SELECT `is_verified`, `password`, `is_active` FROM `service_providers` WHERE `email` = ?";
                connection.query(sql, [email, key], (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        if (result && result[0]) {
                            if (result[0].is_active === 1) {
                                if (result[0].is_verified === 1) {
                                    res.status(400).send({
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
                bcrypt.hash(password, 10, (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                })
            },
            (encryptedPassword, callback) => {
                sql = "UPDATE `service_providers` SET `password` = ?, `is_verified` = 1, `updated_at` = NOW() WHERE `email` = ?";
                connection.query(sql, [encryptedPassword, email], (err, result) => {
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

exports.fetchServiceProviderDetails = (req, res) => {
    res.status(200).send({
        message: 'service provider details fetched successfully',
        data: (res.locals.user.role === 4 ? res.locals.user : null)
    })
}

exports.fetchServiceProviders = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({
            errors: errors.array(),
            message: 'validation error'
        })
    } else {
        const admin = res.locals.user;
        if (admin.role === 1 || admin.role === 2) {
            const offset = parseInt(req.body.offset) || 0;
            const limit = parseInt(req.body.limit) || 10;
            const search = req.body.search || "";
            const request_type = parseInt(req.body.request_type) || 0; // request_type =  0 --> all, 1 -> active, 2 --> deactive, 3 --> verified, 4 --> not verified 
            let sql, requestTypeQuery;

            const searchQuery = "(`first_name` LIKE '" + search + "%' OR  `last_name` LIKE '" + search + "%' OR `email` LIKE '" + search + "%')";

            if (request_type === 1) {
                requestTypeQuery = "`is_active` = 1";
            } else if (request_type === 2) {
                requestTypeQuery = "`is_active` = 0";
            } else if (request_type === 3) {
                requestTypeQuery = "`is_verified` = 1";
            } else if (request_type === 4) {
                requestTypeQuery = "`is_verified` = 0";
            } else {
                requestTypeQuery = "1";
            }

            async.parallel([
                callback => {
                    sql = "SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `image`, `is_active`, `is_verified`, `created_at`, `updated_at` FROM `service_providers` WHERE `role` = 4 AND " + searchQuery + " AND " + requestTypeQuery + " ORDER BY `updated_at` DESC LIMIT " + offset + "," + limit;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, result)
                        }
                    })
                },
                callback => {
                    sql = "SELECT COUNT(`id`) AS total_super_service_providers FROM `service_providers` WHERE `role` = 4 AND " + searchQuery + " AND " + requestTypeQuery;
                    connection.query(sql, [], (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            if (result[0] && result[0].total_super_service_providers) {
                                callback(null, result[0].total_super_service_providers)
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
                        message: 'service_providers list fetched successfully',
                        data: {
                            service_providers: data,
                            total_service_providers: results[1] || 0
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
