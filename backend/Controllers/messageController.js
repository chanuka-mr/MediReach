const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");

/**
 * @desc Send a new message in a chat
 * @route POST /api/messages
 * @access Protected
 */
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).send({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user._id,
    text: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email contactNumber",
    });

    // Update latestMessage in Chat model
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

/**
 * @desc Get all messages for a specific chat
 * @route GET /api/messages/:chatId
 * @access Protected
 */
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email contactNumber")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { allMessages, sendMessage };
