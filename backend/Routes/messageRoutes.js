const express = require("express");
const { allMessages, sendMessage, markAsRead } = require("../Controllers/messageController");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/mark-as-read/:chatId").put(protect, markAsRead);

module.exports = router;
