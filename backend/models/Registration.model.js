const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketId: { type: String, unique: true, sparse: true },
    qrCode: { type: String },
    paymentStatus: {
        type: String,
        enum: ['free', 'pending', 'verified', 'rejected'],
        default: 'free'
    },
    paymentScreenshot: { type: String },
    attended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
