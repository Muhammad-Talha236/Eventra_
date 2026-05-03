const Announcement = require('../models/Announcement.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User');

// @desc    Get all announcements
// @route   GET /api/announcements
exports.getAllAnnouncements = async (req, res) => {
    try {
        let filter = {};

        // Non-admin users only see announcements targeted at 'all' or their role
        if (req.user.role !== 'admin') {
            filter.targetRole = { $in: ['all', req.user.role] };
        }

        const announcements = await Announcement.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, targetRole } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type,
            targetRole,
            createdBy: req.user._id
        });

        // Create notifications for all users matching targetRole
        try {
            let userFilter = {};
            if (targetRole && targetRole !== 'all') {
                userFilter.role = targetRole;
            }
            const users = await User.find(userFilter).select('_id');
            if (users.length > 0) {
                const notifications = users.map(u => ({
                    title: `📢 ${title}`,
                    message: message.length > 120 ? message.substring(0, 120) + '...' : message,
                    receiver: u._id,
                    type: 'announcement'
                }));
                await Notification.insertMany(notifications);
            }
        } catch (notifErr) {
            console.error('Failed to create announcement notifications:', notifErr.message);
        }

        const populated = await Announcement.findById(announcement._id)
            .populate('createdBy', 'name');

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
