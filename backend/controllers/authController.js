const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, password, role, studentInfo, outsiderInfo } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            studentInfo,
            outsiderInfo
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user with password field included
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
        }

        const token = generateToken(user._id, user.role);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                studentInfo: user.studentInfo,
                outsiderInfo: user.outsiderInfo
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, password, studentInfo, outsiderInfo } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (studentInfo) user.studentInfo = { ...user.studentInfo?.toObject?.() || {}, ...studentInfo };
        if (outsiderInfo) user.outsiderInfo = { ...user.outsiderInfo?.toObject?.() || {}, ...outsiderInfo };
        if (password) user.password = password; // hashed by pre-save hook

        await user.save();

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                studentInfo: user.studentInfo,
                outsiderInfo: user.outsiderInfo
            }
        });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};