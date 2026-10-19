const fs = require('fs');
const Message = require('../models/Message');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const {
  cloudinary,
  uploadToCloudinary,
  uploadRawToCloudinary,
} = require('../config/cloudinary');

const isSupportedFile = (file) => {
  const extensionOk = /\.(pdf|jpe?g|png)$/i.test(file.originalname || '');
  const mimeOk = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype);
  if (!extensionOk || !mimeOk) return false;

  const header = fs.readFileSync(file.path).subarray(0, 8);
  if (file.mimetype === 'application/pdf') return header.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/png') return header.toString('hex') === '89504e470d0a1a0a';
  return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
};

const signedAttachmentUrl = (attachment) => {
  if (attachment?.downloadUrl) return attachment.downloadUrl;
  if (!attachment?.publicId) return attachment?.url;
  if (attachment.storageType !== 'authenticated') return attachment.url;
  return cloudinary.url(attachment.publicId, {
    resource_type: attachment.mimeType === 'application/pdf' ? 'raw' : 'image',
    type: 'authenticated',
    sign_url: true,
    secure: true,
  });
};

const canChatWith = async (userId, otherUser) => {
  if (!otherUser || userId.toString() === otherUser._id.toString()) return false;
  if (!['patient', 'dentist'].includes(otherUser.role)) return false;
  const doctorId = otherUser.role === 'dentist' ? otherUser._id : userId;
  const patientId = otherUser.role === 'patient' ? otherUser._id : userId;
  const doctorFilter = {
    $or: [{ doctorId }, { doctorId: { $exists: false }, dentist: doctorId }],
  };
  return Boolean(await Appointment.exists({ ...doctorFilter, patient: patientId }));
};

const getAuthorizedRecipient = async (req, res, userId) => {
  const recipient = await User.findById(userId).select('name avatar role');
  if (!recipient) {
    res.status(404).json({ success: false, message: 'User not found' });
    return null;
  }
  if (!(await canChatWith(req.user._id, recipient))) {
    res.status(403).json({ success: false, message: 'You are not a participant in this conversation' });
    return null;
  }
  return recipient;
};

// @desc    Get message history with a specific user
// @route   GET /api/chat/:userId/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const otherUser = await getAuthorizedRecipient(req, res, userId);
    if (!otherUser) return;

    const conversationId = Message.buildConversationId(req.user._id, userId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('sender', 'name avatar role');

    messages.forEach((message) => {
      if (message.attachment?.publicId) {
        message.attachment.downloadUrl = signedAttachmentUrl(message.attachment);
      }
    });

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
    const authorizedConversations = [];
    for (const conversation of populated) {
      const senderId = conversation.lastMessage.sender?._id?.toString();
      const receiverId = conversation.lastMessage.receiver?._id?.toString();
      const otherId = senderId === userId.toString() ? receiverId : senderId;
      const otherUser = otherId ? await User.findById(otherId).select('_id role') : null;
      if (await canChatWith(userId, otherUser)) authorizedConversations.push(conversation);
    }

    res.status(200).json({ success: true, conversations: authorizedConversations });
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

    const receiver = await getAuthorizedRecipient(req, res, userId);
    if (!receiver) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
      return;
    }

    let attachment;
    if (req.file) {
      if (!isSupportedFile(req.file)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          success: false,
          message: 'File content does not match a supported PDF, JPG, JPEG, or PNG file',
        });
      }
      const uploaded = req.file.mimetype === 'application/pdf'
        ? await uploadRawToCloudinary(req.file.path, 'dentai/chat', { type: 'authenticated' })
        : await uploadToCloudinary(req.file.path, 'dentai/chat', { type: 'authenticated' });
      attachment = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: req.file.mimetype === 'application/pdf' ? 'pdf' : 'image',
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        storageType: 'authenticated',
      };
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

    if (message.attachment) {
      message.attachment.downloadUrl = signedAttachmentUrl(message.attachment);
      await message.save();
    }
    const populated = await message.populate('sender', 'name avatar role');

    // If Socket.io instance is attached to app, emit in real-time too
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('newMessage', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

const getAttachment = async (req, res, next) => {
  try {
    const recipient = await getAuthorizedRecipient(req, res, req.params.userId);
    if (!recipient) return;

    const message = await Message.findOne({
      _id: req.params.messageId,
      conversationId: Message.buildConversationId(req.user._id, req.params.userId),
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });
    if (!message?.attachment?.publicId) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    return res.status(200).json({
      success: true,
      url: signedAttachmentUrl(message.attachment),
      filename: message.attachment.filename,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, getConversations, sendMessageREST, getAttachment };
