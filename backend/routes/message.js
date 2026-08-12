import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get chat history between two users
router.get('/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ timestamp: 1 }).populate('sender', 'displayName avatar username');

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Message({
      sender,
      receiver,
      content
    });

    await newMessage.save();
    
    // Populate sender info for immediate frontend display
    await newMessage.populate('sender', 'displayName avatar username');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
