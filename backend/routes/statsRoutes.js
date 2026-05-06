const express = require('express');
const router = express.Router();
const { getAdminStats, syncRegisteredCounts } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/stats — admin and staff only
router.get('/', protect, authorize('admin', 'staff'), getAdminStats);

// POST /api/stats/sync-counts — admin only (one-time repair endpoint)
router.post('/sync-counts', protect, authorize('admin'), syncRegisteredCounts);

module.exports = router;
