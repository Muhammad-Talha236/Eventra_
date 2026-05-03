const Incident = require('../models/Incident.model');
const Notification = require('../models/Notification.model');

// @desc    Get all incidents (admin/staff)
// @route   GET /api/incidents
exports.getAllIncidents = async (req, res) => {
    try {
        const { status, priority, type } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (type) filter.type = type;

        const incidents = await Incident.find(filter)
            .populate('reportedBy', 'name email')
            .populate('event', 'title venue')
            .sort({ createdAt: -1 });
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get my incidents
// @route   GET /api/incidents/my
exports.getMyIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({ reportedBy: req.user._id })
            .populate('event', 'title venue')
            .sort({ createdAt: -1 });
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Report incident
// @route   POST /api/incidents
exports.reportIncident = async (req, res) => {
    try {
        const { title, description, type, priority, event } = req.body;

        const incidentData = {
            title,
            description,
            type,
            priority,
            reportedBy: req.user._id,
        };
        if (event) incidentData.event = event;

        const incident = await Incident.create(incidentData);

        const populated = await Incident.findById(incident._id)
            .populate('reportedBy', 'name')
            .populate('event', 'title');

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update incident status
// @route   PUT /api/incidents/:id/status
exports.updateIncidentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('reportedBy', 'name').populate('event', 'title');

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // Create notification for the reporter
        try {
            await Notification.create({
                title: 'Incident Status Updated',
                message: `Your incident "${incident.title}" status changed to ${status.replace('_', ' ')}.`,
                receiver: incident.reportedBy._id || incident.reportedBy,
                type: 'incident'
            });
        } catch (notifErr) {
            console.error('Failed to create incident notification:', notifErr.message);
        }

        res.json(incident);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
exports.deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }
        res.json({ message: 'Incident deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
