const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../Controllers/userController");
const { protect, admin } = require("../Middleware/authMiddleware");

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
