const crypto = require('crypto');
const QRCode = require('qrcode');
const Registration = require('../models/Registration.model');
const Event = require('../models/Event');

// @desc    Register for an event
// @route   POST /api/registrations
exports.registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check capacity
        if (event.registeredCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Check duplicate registration
        const existing = await Registration.findOne({ user: userId, event: eventId });
        if (existing) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // Generate unique ticket ID
        const ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        // Generate QR code from ticketId
        const qrCode = await QRCode.toDataURL(ticketId);

        const registration = await Registration.create({
            user: userId,
            event: eventId,
            ticketId,
            qrCode,
            paymentStatus: event.isFree ? 'free' : 'pending'
        });

        // Increment registered count
        event.registeredCount += 1;
        await event.save();

        const populated = await Registration.findById(registration._id).populate('event');
        res.status(201).json(populated);
    } catch (err) {
        console.error('Register for event error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id })
            .populate('event')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all registrations (admin/staff — for payments page)
// @route   GET /api/registrations/all
exports.getAllRegistrations = async (req, res) => {
    try {
        const { paymentStatus } = req.query;
        let query = {};
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const registrations = await Registration.find(query)
            .populate('user', 'name email')
            .populate('event', 'title fee')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get registrations for a specific event
// @route   GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.eventId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update payment status
// @route   PUT /api/registrations/:id/payment
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        ).populate('user', 'name email').populate('event', 'title');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json(registration);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark / toggle attendance
// @route   PUT /api/registrations/:id/attendance
exports.markAttendance = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.attended = !registration.attended;
        await registration.save();

        const populated = await Registration.findById(registration._id)
            .populate('user', 'name email')
            .populate('event', 'title');

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Upload payment screenshot
// @route   PUT /api/registrations/:id/payment-screenshot
exports.uploadPaymentScreenshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.paymentScreenshot = `/uploads/${req.file.filename}`;
        await registration.save();

        res.json(registration);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
exports.cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Decrement event count
        await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
        await Registration.findByIdAndDelete(req.params.id);

        res.json({ message: 'Registration cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
