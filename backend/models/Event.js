const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['seminar', 'workshop', 'sports', 'cultural', 'tech', 'concert', 'esports', 'other'],
        default: 'other'
    },
    venue: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    capacity: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    banner: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
