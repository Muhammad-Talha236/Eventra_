const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, authorize('admin', 'staff'), createEvent);
router.put('/:id', protect, authorize('admin', 'staff'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;