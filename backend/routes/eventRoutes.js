const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, authorize('admin', 'staff'), createEvent);
router.put('/:id', protect, authorize('admin', 'staff'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

// Banner upload
router.put('/:id/banner', protect, authorize('admin', 'staff'), upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const Event = require('../models/Event');
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { banner: `/uploads/${req.file.filename}` },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;