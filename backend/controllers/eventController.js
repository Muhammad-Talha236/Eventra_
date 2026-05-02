const Event = require('../models/Event');

// @desc    Get all events (public)
// @route   GET /api/events
exports.getAllEvents = async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const events = await Event.find(query).sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single event (public)
// @route   GET /api/events/:id
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const { title, description, category, venue, date, startTime, endTime, capacity, fee, banner, status } = req.body;

        const event = await Event.create({
            title,
            description,
            category,
            venue,
            date,
            startTime,
            endTime,
            capacity,
            fee: fee || 0,
            isFree: !fee || fee === 0,
            banner,
            status,
            createdBy: req.user._id
        });

        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        // If fee is being updated, also update isFree
        if (req.body.fee !== undefined) {
            req.body.isFree = !req.body.fee || req.body.fee === 0;
        }

        const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
