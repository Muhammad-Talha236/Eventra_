const crypto = require('crypto');
const QRCode = require('qrcode');
const Registration = require('../models/Registration.model');
const Event = require('../models/Event');
const Notification = require('../models/Notification.model');

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

        // Check for existing registration — allow re-registration if previous was rejected
        const existing = await Registration.findOne({ user: userId, event: eventId });
        if (existing) {
            if (existing.paymentStatus === 'rejected') {
                // Allow re-registration: reset the existing record
                existing.paymentStatus = event.isFree ? 'free' : 'pending';
                // Only generate ticketId for free events; for paid events, generate on verification
                if (event.isFree) {
                    existing.ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
                    existing.qrCode = await QRCode.toDataURL(existing.ticketId);
                } else {
                    // Clear ticketId for paid events until verification
                    existing.ticketId = null;
                    existing.qrCode = null;
                }
                existing.attended = false;
                existing.paymentScreenshot = undefined;
                await existing.save();

                // Re-increment registered count
                event.registeredCount += 1;
                await event.save();

                const populated = await Registration.findById(existing._id).populate('event');
                return res.status(200).json(populated);
            }
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // For free events, generate ticket immediately; for paid events, wait for verification
        let ticketId = null;
        let qrCode = null;
        
        if (event.isFree) {
            ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
            qrCode = await QRCode.toDataURL(ticketId);
        }

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

        const [registrations, pending, verified, rejected] = await Promise.all([
            Registration.find(query)
                .populate('user', 'name email')
                .populate('event', 'title fee')
                .sort({ createdAt: -1 }),
            Registration.countDocuments({ paymentStatus: 'pending' }),
            Registration.countDocuments({ paymentStatus: { $in: ['verified', 'free'] } }),
            Registration.countDocuments({ paymentStatus: 'rejected' }),
        ]);

        res.json({ registrations, counts: { pending, verified, rejected } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get registrations for a specific event (exclude rejected)
// @route   GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ 
            event: req.params.eventId,
            paymentStatus: { $ne: 'rejected' }
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Compute summary counts
        const total = registrations.length;
        const verified = registrations.filter(r => r.paymentStatus === 'verified' || r.paymentStatus === 'free').length;
        const pending = registrations.filter(r => r.paymentStatus === 'pending').length;
        const attended = registrations.filter(r => r.attended).length;

        res.json({ registrations, summary: { total, verified, pending, attended } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update payment status
// @route   PUT /api/registrations/:id/payment
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const registration = await Registration.findById(req.params.id)
            .populate('event', 'title');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const oldStatus = registration.paymentStatus;
        const newStatus = paymentStatus;

        // Adjust event.registeredCount based on status transitions
        if (oldStatus !== 'rejected' && newStatus === 'rejected') {
            // Moving TO rejected → decrement count
            await Event.findByIdAndUpdate(registration.event._id || registration.event, {
                $inc: { registeredCount: -1 }
            });
            // Safeguard: ensure count never goes below 0
            await Event.updateOne(
                { _id: registration.event._id || registration.event, registeredCount: { $lt: 0 } },
                { $set: { registeredCount: 0 } }
            );
        } else if (oldStatus === 'rejected' && newStatus !== 'rejected') {
            // Moving FROM rejected → re-increment count
            await Event.findByIdAndUpdate(registration.event._id || registration.event, {
                $inc: { registeredCount: 1 }
            });
        }

        const eventTitle = registration.event?.title || 'an event';

        // Generate ticket when payment is verified (only for paid events that don't have a ticket yet)
        if (newStatus === 'verified' && oldStatus !== 'verified' && !registration.ticketId) {
            const ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
            const qrCode = await QRCode.toDataURL(ticketId);
            registration.ticketId = ticketId;
            registration.qrCode = qrCode;
        }

        registration.paymentStatus = newStatus;
        await registration.save();

        // Create notification for the user
        if (newStatus === 'verified' && oldStatus !== 'verified') {
            await Notification.create({
                title: 'Payment Verified — Your Ticket is Ready!',
                message: `Your payment for "${eventTitle}" has been verified. Your ticket is now available.`,
                receiver: registration.user,
                type: 'payment'
            });
        } else if (newStatus === 'rejected' && oldStatus !== 'rejected') {
            await Notification.create({
                title: 'Payment Rejected',
                message: `Your payment for "${eventTitle}" was rejected. Please contact admin for assistance.`,
                receiver: registration.user,
                type: 'payment'
            });
        }

        const populated = await Registration.findById(registration._id)
            .populate('user', 'name email')
            .populate('event', 'title');

        res.json(populated);
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

        const registration = await Registration.findById(req.params.id)
            .populate('event', 'title')
            .populate('user', 'name email');
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Ownership check: only the registration owner can upload
        if (registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to upload for this registration' });
        }

        registration.paymentScreenshot = `/uploads/payments/${req.file.filename}`;
        await registration.save();

        // Create notification for admins about new payment awaiting verification
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' }).select('_id');
        const eventTitle = registration.event?.title || 'an event';
        const userName = registration.user?.name || 'A user';
        
        const adminNotifications = admins.map(admin => ({
            title: 'New Payment Awaiting Verification',
            message: `${userName} submitted payment for "${eventTitle}". Please verify.`,
            receiver: admin._id,
            type: 'payment'
        }));
        
        if (adminNotifications.length > 0) {
            await Notification.insertMany(adminNotifications);
        }

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

        // Only decrement count if registration was not already rejected
        if (registration.paymentStatus !== 'rejected') {
            await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
            // Safeguard: never below 0
            await Event.updateOne(
                { _id: registration.event, registeredCount: { $lt: 0 } },
                { $set: { registeredCount: 0 } }
            );
        }

        await Registration.findByIdAndDelete(req.params.id);
        res.json({ message: 'Registration cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
