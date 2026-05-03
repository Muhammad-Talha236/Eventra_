const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration.model');
const Incident = require('../models/Incident.model');

// @desc    Get admin dashboard stats
// @route   GET /api/stats
exports.getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalRegistrations, pendingPayments, openIncidents, topEvents] =
            await Promise.all([
                User.countDocuments(),
                Event.countDocuments(),
                Registration.countDocuments(),
                Registration.countDocuments({ paymentStatus: 'pending' }),
                Incident.countDocuments({ status: 'open' }),
                Registration.aggregate([
                    {
                        $group: {
                            _id: '$event',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: 'events',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'event'
                        }
                    },
                    { $unwind: '$event' },
                    {
                        $project: {
                            _id: 0,
                            eventId: '$event._id',
                            title: '$event.title',
                            registrations: '$count'
                        }
                    }
                ])
            ]);

        res.json({
            totalUsers,
            totalEvents,
            totalRegistrations,
            pendingPayments,
            openIncidents,
            topEvents
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
