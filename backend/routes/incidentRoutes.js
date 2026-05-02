const express = require('express');
const router = express.Router();
const {
    getAllIncidents,
    getMyIncidents,
    reportIncident,
    updateIncidentStatus,
    deleteIncident
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin', 'staff'), getAllIncidents);
router.get('/my', protect, getMyIncidents);
router.post('/', protect, reportIncident);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateIncidentStatus);
router.delete('/:id', protect, authorize('admin'), deleteIncident);

module.exports = router;
