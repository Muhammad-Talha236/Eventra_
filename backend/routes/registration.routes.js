const express = require('express');
const router = express.Router();
const {
    registerForEvent,
    getMyRegistrations,
    getAllRegistrations,
    getEventRegistrations,
    updatePaymentStatus,
    markAttendance,
    uploadPaymentScreenshot,
    cancelRegistration
} = require('../controllers/registration.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes are protected
router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/all', protect, authorize('admin', 'staff'), getAllRegistrations);
router.get('/event/:eventId', protect, authorize('admin', 'staff'), getEventRegistrations);
router.put('/:id/payment', protect, authorize('admin', 'staff'), updatePaymentStatus);
router.put('/:id/attendance', protect, authorize('admin', 'staff'), markAttendance);
router.put('/:id/payment-screenshot', protect, upload.paymentUpload.single('paymentScreenshot'), uploadPaymentScreenshot);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
