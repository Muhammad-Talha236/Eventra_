const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/stats — admin and staff only
router.get('/', protect, authorize('admin', 'staff'), getAdminStats);

module.exports = router;
