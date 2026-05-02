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

router.get('/', protect, authorize('admin', 'staff', 'main_head', 'co_head'), getAllTasks);
router.get('/my', protect, getMyTasks);
router.post('/', protect, authorize('admin', 'staff', 'main_head', 'co_head'), createTask);
router.put('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, authorize('admin', 'staff', 'main_head'), deleteTask);

module.exports = router;
