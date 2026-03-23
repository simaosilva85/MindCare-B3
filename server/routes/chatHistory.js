import express from "express";
import { protect } from "../middleware/auth.js";
import ChatHistory from "../models/ChatHistory.js";

const router = express.Router();

// GET /api/chat-history — load chat history for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user._id });
    res.json({ messages: history?.messages || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat-history — save chat history for logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const { messages } = req.body;

    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      { messages },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/chat-history — clear chat history
router.delete("/", protect, async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
