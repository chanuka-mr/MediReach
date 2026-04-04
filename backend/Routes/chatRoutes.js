const express = require("express");
const { accessChat, fetchChats } = require("../Controllers/chatController");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);

module.exports = router;
