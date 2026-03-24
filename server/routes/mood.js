import express from "express";
import jwt from "jsonwebtoken";
import Mood from "../models/Mood.js";

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};

// Sauvegarder ou mettre à jour l'humeur du jour
router.post("/", auth, async (req, res) => {
  try {
    const { mood, date } = req.body;
    const entry = await Mood.findOneAndUpdate(
      { userId: req.user.id, date },
      { mood },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer les 30 derniers jours
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Mood.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(30);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
