const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controllers/pharmacyController');

// Log when routes are accessed
router.use((req, res, next) => {
    console.log(`📨 Pharmacy Route: ${req.method} ${req.url}`);
    next();
});

// ============= READ ROUTES =============
// Get all pharmacies with pagination and filters
router.get('/', pharmacyController.getAllPharmacies);

// Search pharmacies
router.get('/search', pharmacyController.searchPharmacies);

// Get pharmacies by district
router.get('/district/:district', pharmacyController.getPharmaciesByDistrict);

// FEATURE 1: Get nearby pharmacies based on user location
router.get('/nearby', pharmacyController.getNearbyPharmacies);

// FEATURE 2: Get pharmacies open now
router.get('/open-now', pharmacyController.getOpenNowPharmacies);

// FEATURE 2: Get 24/7 pharmacies
router.get('/24-7', pharmacyController.get247Pharmacies);

// FEATURE 3: Get pharmacy statistics
router.get('/stats', pharmacyController.getPharmacyStats);

// Get single pharmacy by ID (this must come AFTER specific routes)
router.get('/:id', pharmacyController.getPharmacyById);


// Test route
router.get('/test', (req, res) => {
    console.log("✅ Test route accessed");
    res.json({ 
        status: 'success',
        message: 'Pharmacy routes are working!' 
    });
});

// ============= CREATE ROUTE =============
router.post('/', pharmacyController.createPharmacy);

// ============= UPDATE ROUTES =============
// Full update (PUT) - replace entire resource
router.put('/:id', pharmacyController.updatePharmacy);

// Partial update (PATCH) - update specific fields
router.patch('/:id', pharmacyController.partiallyUpdatePharmacy);

// Toggle active status
router.patch('/:id/toggle-status', pharmacyController.togglePharmacyStatus);

// Restore soft-deleted pharmacy
router.patch('/:id/restore', pharmacyController.restorePharmacy);

// ============= DELETE ROUTES =============
// Hard delete (permanent)
router.delete('/:id', pharmacyController.deletePharmacyPermanently);

// Soft delete (mark as inactive)
router.delete('/:id/soft', pharmacyController.softDeletePharmacy);

// Bulk delete multiple pharmacies
router.post('/bulk-delete', pharmacyController.bulkDeletePharmacies);

module.exports = router;