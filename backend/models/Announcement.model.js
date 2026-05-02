const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['general', 'event', 'emergency'],
        default: 'general'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: {
        type: String,
        enum: ['all', 'admin', 'staff', 'volunteer', 'user'],
        default: 'all'
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
