const path = require('path');
const sharp = require('sharp');
const async = require('async');

exports.imageResize = (req, res, next) => {
    const temp = req.file.originalname.split('.');
    const extensionName = temp[temp.length - 1];
    const filename = `File_Uploaded-${new Date().getTime()}.${extensionName}`;
    const location = path.join(__dirname, 'Uploads', filename)
    sharp(req.file.buffer).resize(640, 480).toFile(location);
    req.file.filename = filename;
    next();
}

exports.propertyImageResize = (req, res, next) => {
    if (req.files) {
        console.log(req.files.images.length)
        async.parallel([
            callback => {
                if (req.files.thumbnail && req.files.thumbnail[0]) {
                    const temp = req.files.thumbnail[0].originalname.split('.');
                    const extensionName = temp[temp.length - 1];
                    const filename = `File_Uploaded-${new Date().getTime()}.${extensionName}`;
                    const location = path.join(__dirname, '../Uploads', filename)
                    sharp(req.files.thumbnail[0].buffer).resize(640, 480).toFile(location);
                    req.files.thumbnail[0].filename = filename;
                    callback(null)
                } else {
                    callback(null)
                }
            },
            callback => {
                if (req.files.images && req.files.images.length > 0) {
                    async.each(req.files.images, (image, cb) => {
                        let index;
                        req.files.images.map((item, n) => {
                            if (item.originalname === image.originalname) {
                                index = n;
                            }
                        })

                        const temp = image.originalname.split('.');
                        const extensionName = temp[temp.length - 1];
                        const filename = `File_Uploaded-${new Date().getTime()}.${extensionName}`;
                        const location = path.join(__dirname, '../Uploads', filename)
                        sharp(image.buffer).resize(640, 480).toFile(location);
                        image.filename = filename;
                        cb(null)

                    }, () => {
                        callback(null)
                    })
                } else {
                    callback(null)
                }
            }
        ], () => {
            next()
        })
    } else {
        next();
    }
}