const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Deterministic conversation id: sorted "patientId_dentistId"
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    attachment: {
      url: String,
      publicId: String,
      type: { type: String, enum: ['image', 'file'], default: 'image' },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

/**
 * Build a stable conversation id from two user ids, order-independent.
 */
messageSchema.statics.buildConversationId = (idA, idB) => {
  return [idA.toString(), idB.toString()].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
