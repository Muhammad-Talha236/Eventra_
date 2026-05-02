const Announcement = require('../models/Announcement.model');

// @desc    Get all announcements
// @route   GET /api/announcements
exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
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
