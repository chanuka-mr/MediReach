const express = require('express');
const router = express.Router();
const inquiryController = require('../Controllers/inquiryController');

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
// Get all inquiries
router.get('/', inquiryController.getAllInquiries);

// Update inquiry (status/priority)
router.patch('/:id', inquiryController.updateInquiry);

// Delete inquiry
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
