const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) {
            // Support comma-separated roles: ?role=volunteer,staff
            const roles = role.split(',');
            query.role = { $in: roles };
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Add staff member
// @route   POST /api/users/add-staff
exports.addStaffMember = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Staff can only add volunteers
        if (req.user.role === 'staff') {
            if (role !== 'volunteer') {
                return res.status(403).json({ message: 'Staff can only add volunteers' });
            }
        }

        const allowedRoles = ['staff', 'volunteer'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(', ')}` });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isVerified: true
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
