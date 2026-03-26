const express = require('express');
const router = express.Router();
const {
    generateInventoryReport,
    generateExpiryReport,
    generateLowStockReport,
    generatePharmacyReport,
    generateOrdersReport
} = require('../Controllers/reportController');

// ─── Report Routes ───────────────────────────────────────────────────────

// GET /api/reports/inventory - Generate inventory report
// Query params: format (json|pdf), pharmacy, category
router.get('/inventory', generateInventoryReport);

// GET /api/reports/expiry - Generate expiry report
// Query params: format (json|pdf), days (default: 90)
router.get('/expiry', generateExpiryReport);

// GET /api/reports/low-stock - Generate low stock report
// Query params: format (json), threshold (default: 10)
router.get('/low-stock', generateLowStockReport);

// GET /api/reports/pharmacy - Generate pharmacy performance report
// Query params: format (json), pharmacyId
router.get('/pharmacy', generatePharmacyReport);

// GET /api/reports/orders - Generate orders report
// Query params: format (json|pdf), pharmacy, status, priority, startDate, endDate
router.get('/orders', generateOrdersReport);

module.exports = router;
