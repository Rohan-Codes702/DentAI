const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Attaches all Socket.io event handlers.
 * Each connected user joins a room named after their own userId,
 * so sending to `io.to(userId)` reaches all their active tabs/devices.
 */
const initChatSocket = (io) => {
  // Authenticate every socket connection using the JWT (sent as `auth.token`)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userId);
    logger.info(`Socket connected: user=${userId} socket=${socket.id}`);

    // Notify the other side this user is online (optional presence feature)
    socket.broadcast.emit('userOnline', { userId });

    // ---- Send message ----
    socket.on('sendMessage', async ({ receiverId, text, attachment }, callback) => {
      try {
        if (!receiverId || (!text && !attachment)) {
          return callback?.({ success: false, message: 'receiverId and text/attachment required' });
        }

        const conversationId = Message.buildConversationId(userId, receiverId);
        const message = await Message.create({
          conversationId,
          sender: userId,
          receiver: receiverId,
          text,
          attachment,
        });
        const populated = await message.populate('sender', 'name avatar role');

        // Emit to both participants' rooms
        io.to(receiverId).to(userId).emit('newMessage', populated);

        callback?.({ success: true, message: populated });
      } catch (err) {
        logger.error('sendMessage socket error:', err.message);
        callback?.({ success: false, message: 'Failed to send message' });
      }
    });

    // ---- Typing indicator ----
    socket.on('typing', ({ receiverId }) => {
      io.to(receiverId).emit('typing', { userId });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      io.to(receiverId).emit('stopTyping', { userId });
    });

    // ---- Read receipts ----
    socket.on('markRead', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, receiver: userId, read: false },
          { read: true, readAt: new Date() }
        );
        io.to(conversationId).emit('messagesRead', { conversationId, readBy: userId });
      } catch (err) {
        logger.error('markRead socket error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user=${userId}`);
      socket.broadcast.emit('userOffline', { userId });
    });
  });
};

module.exports = initChatSocket;
