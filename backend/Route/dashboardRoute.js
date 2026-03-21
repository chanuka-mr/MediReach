// Route/dashboardRoute.js
const express  = require("express");
const router   = express.Router();
const Medicine = require("../Model/medicineModel");

// ── You'll add these models when ready ────────────────────────────
// const Pharmacy          = require("../Model/pharmacyModel");
// const MedicationRequest = require("../Model/medicationRequestModel");

// ── GET /api/dashboard/stats ──────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [
      totalMedicines,
      lowStockMedicines,
      expiringMedicines,
    ] = await Promise.all([
      Medicine.countDocuments(),
      Medicine.countDocuments({ mediStock: { $lt: 50 } }),
      Medicine.countDocuments({
        mediExpiryDate: {
          $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // within 60 days
        }
      }),
    ]);

    // Uncomment when Pharmacy + MedicationRequest models are connected:
    // const totalPharmacies    = await Pharmacy.countDocuments();
    // const activePharmacies   = await Pharmacy.countDocuments({ isActive: true });
    // const totalOrders        = await MedicationRequest.countDocuments();
    // const pendingOrders      = await MedicationRequest.countDocuments({ status: "Pending" });
    // const urgentOrders       = await MedicationRequest.countDocuments({ priority_level: { $in: ["Urgent","Emergency"] } });

    res.json({
      totalMedicines,
      lowStockMedicines,
      expiringMedicines,
      // totalPharmacies,
      // activePharmacies,
      // totalOrders,
      // pendingOrders,
      // urgentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dashboard/medicines ─────────────────────────────────
router.get("/medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dashboard/pharmacies ────────────────────────────────
// Uncomment when pharmacyModel is in your project:
// router.get("/pharmacies", async (req, res) => {
//   try {
//     const pharmacies = await Pharmacy.find().sort({ createdAt: -1 });
//     res.json(pharmacies);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ── GET /api/dashboard/orders/recent ─────────────────────────────
// Uncomment when MedicationRequest model is in your project:
// router.get("/orders/recent", async (req, res) => {
//   try {
//     const orders = await MedicationRequest.find()
//       .sort({ createdAt: -1 })
//       .limit(10);
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;