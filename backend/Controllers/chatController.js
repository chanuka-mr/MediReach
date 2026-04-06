const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");
const Message = require("../Models/messageModel");

/**
 * @desc Create or fetch a one-on-one chat between two users
 * @route POST /api/chat
 * @access Protected
 */
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400).send({ message: "UserId param not sent with request" });
  }

  // Find if a chat already exists between these two users
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email contactNumber",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

/**
 * @desc Fetch all chats for a specific user/pharmacy
 * @route GET /api/chat
 * @access Protected
 */
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email contactNumber",
        });

        // Add unreadCount to each chat
        const chatWithUnread = await Promise.all(
          results.map(async (chat) => {
            const unreadCount = await Message.countDocuments({
              chat: chat._id,
              readBy: { $ne: req.user._id },
              sender: { $ne: req.user._id },
            });
            return { ...chat._doc, unreadCount };
          })
        );

        res.status(200).send(chatWithUnread);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = {
  accessChat,
  fetchChats,
};
