const Task = require('../models/Task.model');
const Notification = require('../models/Notification.model');

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email')
            .populate('event', 'title')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('event', 'title venue date')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, event, deadline, priority } = req.body;

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user._id,
            event,
            deadline,
            priority
        });

        // Create notification for the assigned user
        await Notification.create({
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${title}"`,
            receiver: assignedTo,
            type: 'task'
        });

        const populated = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name')
            .populate('event', 'title');

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('assignedTo', 'name').populate('event', 'title');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
