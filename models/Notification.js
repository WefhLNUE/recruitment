const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding'
  },
  type: {
    type: String,
    enum: ['TASK_REMINDER', 'TASK_COMPLETED', 'TASK_ASSIGNED', 'DOCUMENT_UPLOADED', 'DOCUMENT_REQUIRED', 'ONBOARDING_COMPLETE', 'SYSTEM_ALERT', 'GENERAL'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readDate: {
    type: Date
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  actionUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
