const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String, // Can be user ID or role (e.g., 'admin', 'tenant_123', 'all')
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String, // Optional URL to redirect when notification is clicked
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
