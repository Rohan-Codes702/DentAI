const fs = require('fs');
const Message = require('../models/Message');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get message history with a specific user
// @route   GET /api/chat/:userId/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const otherUser = await User.findById(userId).select('name avatar role');
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const conversationId = Message.buildConversationId(req.user._id, userId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('sender', 'name avatar role');

    // Mark messages sent TO me as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      otherUser,
      messages: messages.reverse(),
      page: Number(page),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all conversations for the logged-in user (last message + unread count)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const populated = await User.populate(messages, [
      { path: 'lastMessage.sender', select: 'name avatar role' },
      { path: 'lastMessage.receiver', select: 'name avatar role' },
    ]);

    res.status(200).json({ success: true, conversations: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via REST (fallback if not using socket directly from client)
// @route   POST /api/chat/:userId/messages
// @access  Private
const sendMessageREST = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    let attachment;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path, 'dentai/chat');
      attachment = { url: uploaded.url, publicId: uploaded.publicId, type: 'image' };
      fs.unlink(req.file.path, () => {});
    }

    if (!text && !attachment) {
      return res.status(400).json({ success: false, message: 'Message text or attachment required' });
    }

    const message = await Message.create({
      conversationId: Message.buildConversationId(req.user._id, userId),
      sender: req.user._id,
      receiver: userId,
      text,
      attachment,
    });

    const populated = await message.populate('sender', 'name avatar role');

    // If Socket.io instance is attached to app, emit in real-time too
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('newMessage', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, getConversations, sendMessageREST };
