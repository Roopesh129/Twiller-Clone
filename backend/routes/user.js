import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// PUT /api/user/preferences/notifications
router.put('/preferences/notifications', async (req, res) => {
  const { userId, notificationsEnabled } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { notificationsEnabled },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Notification preference updated successfully',
      notificationsEnabled: updatedUser.notificationsEnabled,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error updating notification preference', details: error.message });
  }
});

// GET /api/user/all
// Fetch all users for the messages sidebar
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, 'displayName username avatar email').sort({ displayName: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

export default router;