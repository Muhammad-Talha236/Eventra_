const Notification = require('../models/Notification.model');

// @desc    Get my notifications
// @route   GET /api/notifications
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
