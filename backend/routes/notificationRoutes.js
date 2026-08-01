const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications
// Get notifications for a user/tenant (default to 'all' and their specific ID if passed via query)
router.get('/', async (req, res) => {
  try {
    const { recipient } = req.query;
    const query = recipient ? { recipient: { $in: [recipient, 'all'] } } : { recipient: 'all' };
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// PUT /api/notifications/:id/read
// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error updating notification' });
  }
});

// PUT /api/notifications/read-all
// Mark all notifications as read for a specific recipient
router.put('/read-all', async (req, res) => {
  try {
    const { recipient } = req.body;
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient is required' });
    }
    await Notification.updateMany({ recipient: { $in: [recipient, 'all'] }, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error updating notifications' });
  }
});

module.exports = router;
