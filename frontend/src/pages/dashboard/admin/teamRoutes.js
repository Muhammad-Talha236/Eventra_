const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
// Assuming standard auth middlewares exist in your project based on standard conventions
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, teamController.createTeam);
router.get('/my', protect, teamController.getMyTeams);
router.get('/:id', protect, teamController.getTeamById);
router.put('/:id', protect, teamController.updateTeam);
router.post('/:id/register', protect, teamController.registerTeam);
router.get('/', protect, authorize('admin', 'staff'), teamController.getAllTeams);

module.exports = router;