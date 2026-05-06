const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration.model');
const Incident = require('../models/Incident.model');

// @desc    Get admin dashboard stats
// @route   GET /api/stats
exports.getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalRegistrations, pendingPayments, openIncidents, topEvents, registrationsByCategory] =
            await Promise.all([
                User.countDocuments(),
                Event.countDocuments(),
                // Exclude rejected registrations from total count
                Registration.countDocuments({ paymentStatus: { $ne: 'rejected' } }),
                Registration.countDocuments({ paymentStatus: 'pending' }),
                Incident.countDocuments({ status: 'open' }),
                // Top events aggregation — exclude rejected registrations
                Registration.aggregate([
                    { $match: { paymentStatus: { $ne: 'rejected' } } },
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
                ]),
                // Registrations grouped by event category
                Registration.aggregate([
                    { $match: { paymentStatus: { $nin: ['rejected'] } } },
                    {
                        $lookup: {
                            from: 'events',
                            localField: 'event',
                            foreignField: '_id',
                            as: 'eventData'
                        }
                    },
                    { $unwind: '$eventData' },
                    {
                        $group: {
                            _id: '$eventData.category',
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            category: '$_id',
                            count: 1,
                            _id: 0
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
            topEvents,
            registrationsByCategory
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Sync/repair all event registeredCounts from actual registrations (admin only)
// @route   POST /api/stats/sync-counts
exports.syncRegisteredCounts = async (req, res) => {
    try {
        const events = await Event.find();
        let syncedCount = 0;
        const results = [];

        for (const event of events) {
            // Count only non-rejected registrations
            const actualCount = await Registration.countDocuments({
                event: event._id,
                paymentStatus: { $nin: ['rejected'] }
            });

            // Update event with correct count
            const updated = await Event.findByIdAndUpdate(
                event._id,
                { registeredCount: actualCount },
                { new: true }
            );

            results.push({
                eventId: event._id,
                title: event.title,
                previousCount: event.registeredCount,
                actualCount: actualCount,
                corrected: event.registeredCount !== actualCount
            });

            if (event.registeredCount !== actualCount) {
                syncedCount++;
            }
        }

        res.json({
            message: `Synced ${syncedCount} event(s) registration counts`,
            totalEvents: events.length,
            syncedCount,
            details: results
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
