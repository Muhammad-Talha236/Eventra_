const express = require('express');
const router = express.Router();
const {
    getAllTasks,
    getMyTasks,
    createTask,
    updateTaskStatus,
    deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin', 'staff'), getAllTasks);
router.get('/my', protect, getMyTasks);
router.post('/', protect, authorize('admin', 'staff'), createTask);
router.put('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteTask);

module.exports = router;
