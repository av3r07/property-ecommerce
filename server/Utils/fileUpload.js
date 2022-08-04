const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../Uploads'));
    },
    filename: (req, file, callback) => {
        const temp = file.originalname.split('.');
        const extensionName = temp[temp.length - 1]
        callback(null, `File_uploaded_${Date.now()}.${extensionName}`);
    }
});
// const storage = multer.memoryStorage()

const imageFilter = (req, file, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

const fileFilter = (req, file, callback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'application/pdf' || file.mimetype == 'application/docs') {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

exports.uploadImages = multer({ storage: storage, fileFilter: imageFilter });

exports.uploadDocs = multer({ storage: storage, fileFilter: fileFilter })