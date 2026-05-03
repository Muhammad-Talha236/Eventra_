// Centralized error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }

    // Mongoose bad ObjectId / CastError
    if (err.name === 'CastError') {
        return res.status(404).json({ message: 'Resource not found' });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(400).json({ message: `Duplicate field value: ${field}` });
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
