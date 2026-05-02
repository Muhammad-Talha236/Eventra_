const express = require('express');
const router = express.Router();
const {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getAllAnnouncements);
router.post('/', protect, authorize('admin'), createAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
