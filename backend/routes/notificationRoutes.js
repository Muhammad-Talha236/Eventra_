const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth.middleware');

// All routes: protected (any authenticated user)
router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
