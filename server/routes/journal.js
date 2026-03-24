import express from "express";
import jwt from "jsonwebtoken";
import Journal from "../models/Journal.js";

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

// Créer une entrée
router.post("/", auth, async (req, res) => {
  try {
    const { mood, content } = req.body;
    const entry = await Journal.create({ userId: req.user.id, mood, content });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer toutes les entrées
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Supprimer une entrée
router.delete("/:id", auth, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
