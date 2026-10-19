const express = require('express');
const {
  getMessages,
  getConversations,
  sendMessageREST,
  getAttachment,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadChatAttachment } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId/messages', getMessages);
router.post('/:userId/messages', uploadChatAttachment.single('attachment'), sendMessageREST);
router.get('/:userId/messages/:messageId/attachment', getAttachment);

module.exports = router;
