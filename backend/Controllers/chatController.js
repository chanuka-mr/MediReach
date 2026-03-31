const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

// 1. Access or Create Chat
const accessChat = async (req, res) => {
  const { userId, pharmacyId } = req.body;

  if (!userId || !pharmacyId) {
    return res.status(400).json({ message: "userId and pharmacyId are required" });
  }

  try {
    let chat = await Chat.findOne({ user: userId, pharmacy: pharmacyId })
      .populate('user', '-password')
      .populate('pharmacy', '-password')
      .populate('latestMessage');
    
    // Populate latestMessage sender if needed
    if (chat && chat.latestMessage) {
        chat = await chat.populate({
            path: 'latestMessage.sender',
            select: 'name email'
        });
    }

    if (chat) {
      res.status(200).json(chat);
    } else {
      const createdChat = await Chat.create({
        user: userId,
        pharmacy: pharmacyId,
      });

      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate('user', '-password')
        .populate('pharmacy', '-password');
      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to access/create chat", error: error.message });
  }
};

// 2. Fetch User Chats
const fetchUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.params.userId })
      .populate('user', '-password')
      .populate('pharmacy', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user chats", error: error.message });
  }
};

// 3. Fetch Pharmacy Chats
const fetchPharmacyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ pharmacy: req.params.pharmacyId })
      .populate('user', '-password')
      .populate('pharmacy', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pharmacy chats", error: error.message });
  }
};

// 4. Send Message
const sendMessage = async (req, res) => {
  const { chatId, senderId, senderModel, text } = req.body;

  if (!chatId || !senderId || !senderModel || !text) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const newMessage = await Message.create({
      chat: chatId,
      sender: senderId,
      senderModel: senderModel,
      text: text,
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    // Populate standard fields for returning the full object
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// 5. Fetch Messages
const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .sort({ createdAt: 1 }); // Oldest to newest
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

module.exports = {
  accessChat,
  fetchUserChats,
  fetchPharmacyChats,
  sendMessage,
  fetchMessages,
};
