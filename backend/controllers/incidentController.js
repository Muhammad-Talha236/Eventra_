const Incident = require('../models/Incident.model');

// @desc    Get all incidents (admin/staff)
// @route   GET /api/incidents
exports.getAllIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
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

        const incident = await Incident.create({
            title,
            description,
            type,
            priority,
            reportedBy: req.user._id,
            event
        });

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
