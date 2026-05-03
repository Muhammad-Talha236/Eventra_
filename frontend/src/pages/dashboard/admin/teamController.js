const Team = require('../models/Team.model');
const Event = require('../models/Event');
const Registration = require('../models/Registration.model');
const crypto = require('crypto');
const QRCode = require('qrcode');
const Notification = require('../models/Notification.model');

exports.createTeam = async (req, res) => {
    try {
        const { name, eventId, members } = req.body;
        const event = await Event.findById(eventId);
        if (!event || event.registrationType !== 'team') {
            return res.status(400).json({ message: 'Invalid competition event' });
        }
        if (members.length < event.teamSize.min || members.length > event.teamSize.max) {
            return res.status(400).json({ message: `Team size must be between ${event.teamSize.min} and ${event.teamSize.max}` });
        }
        const team = await Team.create({
            name,
            event: eventId,
            captain: req.user._id,
            members
        });
        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({ captain: req.user._id })
            .populate('event')
            .populate('registration')
            .sort({ createdAt: -1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('event')
            .populate('captain', 'name email')
            .populate('registration');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ _id: req.params.id, captain: req.user._id });
        if (!team) return res.status(404).json({ message: 'Team not found' });
        if (team.status !== 'forming') {
            return res.status(400).json({ message: 'Cannot update after registration' });
        }
        const event = await Event.findById(team.event);
        if (req.body.members) {
            if (req.body.members.length < event.teamSize.min || req.body.members.length > event.teamSize.max) {
                return res.status(400).json({ message: `Team size must be between ${event.teamSize.min} and ${event.teamSize.max}` });
            }
            team.members = req.body.members;
        }
        if (req.body.name) team.name = req.body.name;
        await team.save();
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.registerTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ _id: req.params.id, captain: req.user._id }).populate('event');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        if (team.status !== 'forming') return res.status(400).json({ message: 'Team already registered or cancelled' });

        const event = team.event;
        if (event.registeredCount >= event.capacity) {
            return res.status(400).json({ message: 'Competition is full' });
        }

        const memberCount = team.members.length;
        const amount = event.feeType === 'per_member' ? (event.fee || 0) * memberCount : (event.fee || 0);
        const ticketId = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
        const qrCode = await QRCode.toDataURL(ticketId);

        const registration = await Registration.create({
            user: req.user._id,
            event: event._id,
            ticketId,
            qrCode,
            paymentStatus: amount === 0 ? 'free' : 'pending',
            registrationType: 'team',
            team: team._id,
            totalAmount: amount
        });

        team.registration = registration._id;
        team.status = 'registered';
        team.totalFee = amount;
        await team.save();

        await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
        res.json({ team, registration });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('event', 'title').populate('captain', 'name email').populate('registration').sort({ createdAt: -1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};