const express = require("express");
const router = express.Router();
const medicine = require("../Model/medicineModel");
const medicineControl = require("../Controllers/medicineControl");


router.get("/", medicineControl.getAllMedicines);
router.post("/", medicineControl.addmedicine);
router.get("/:id", medicineControl.getById);
router.put("/:id", medicineControl.updateMedicine);
router.delete("/:id", medicineControl.deleteMedicine);

module.exports = router;

