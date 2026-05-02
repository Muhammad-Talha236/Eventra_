const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    addStaffMember,
    updateUserRole,
    toggleUserStatus,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes: admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.post('/add-staff', protect, authorize('admin'), addStaffMember);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
