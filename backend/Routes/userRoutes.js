const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
} = require("../Controllers/userController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// Profile routes (protected)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// Admin routes (Admin only)
router.route("/").get(protect, authorize("admin"), getAllUsers);
router
  .route("/:id")
  .get(protect, authorize("admin"), getUserById)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
