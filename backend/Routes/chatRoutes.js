const express = require('express');
const {
  accessChat,
  fetchUserChats,
  fetchPharmacyChats,
  sendMessage,
  fetchMessages,
} = require('../Controllers/chatController');

const router = express.Router();

// Access or create a chat
router.post('/start', accessChat);

// Fetch all chats for a user
router.get('/user/:userId', fetchUserChats);

// Fetch all chats for a pharmacy
router.get('/pharmacy/:pharmacyId', fetchPharmacyChats);

// Send a message
router.post('/message', sendMessage);

// Fetch all messages for a specific chat
router.get('/:chatId/messages', fetchMessages);

module.exports = router;
