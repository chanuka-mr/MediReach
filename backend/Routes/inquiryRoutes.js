const express = require('express');
const router = express.Router();
const inquiryController = require('../Controllers/inquiryController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Log when routes are accessed
router.use((req, res, next) => {
    console.log(`✉️ Inquiry Route: ${req.method} ${req.url}`);
    next();
});

// ============= PUBLIC ROUTE =============
// Create a new inquiry (Contact Us form)
router.post('/', inquiryController.createInquiry);

// ============= USER ROUTES =============    
// Get inquiries by email
router.get('/by-email/:email', inquiryController.getInquiriesByEmail);

// User update inquiry (restricted)
router.patch('/user/:id', inquiryController.userUpdateInquiry);

// User delete inquiry
router.delete('/user/:id', inquiryController.userDeleteInquiry);

// ============= ADMIN ROUTES =============
// Get all inquiries - requires admin role
router.get('/', protect, authorize('admin'), inquiryController.getAllInquiries);

// Update inquiry (status/priority) - requires admin role
router.patch('/:id', protect, authorize('admin'), inquiryController.updateInquiry);

// Delete inquiry - requires admin role
router.delete('/:id', protect, authorize('admin'), inquiryController.deleteInquiry);

module.exports = router;
