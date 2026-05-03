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

router.get('/', protect, authorize('admin', 'staff'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'staff'), getUserById);
router.post('/add-staff', protect, authorize('admin', 'staff'), addStaffMember);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
