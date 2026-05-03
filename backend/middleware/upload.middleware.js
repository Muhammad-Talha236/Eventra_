const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Configure storage with timestamp prefix and original extension
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '..', 'uploads');
        ensureDir(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${name}${ext}`);
    }
});

// Payment-specific storage — saves to uploads/payments/
const paymentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '..', 'uploads', 'payments');
        ensureDir(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

// File filter — images only
const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
    }
};

// Upload instance — image only, max 5 MB
const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Payment upload instance
const paymentUpload = multer({
    storage: paymentStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
module.exports.paymentUpload = paymentUpload;
