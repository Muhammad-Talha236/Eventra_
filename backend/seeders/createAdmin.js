const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        const existingAdmin = await User.findOne({ email: 'admin@eventra.com' });

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping...');
        } else {
            await User.create({
                name: 'Admin',
                email: 'admin@eventra.com',
                password: 'Admin@1234',
                role: 'admin',
                isVerified: true,
                isActive: true
            });
            console.log('Admin user created successfully!');
            console.log('  Email: admin@eventra.com');
            console.log('  Password: Admin@1234');
        }

        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err.message);
        process.exit(1);
    }
};

createAdmin();
