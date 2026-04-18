import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().toLowerCase().email("Email invalide").max(254),
  password: z.string().min(6, "6 caractères minimum").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide").max(254),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Données invalides",
      errors: parsed.error.flatten(),
    });
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ message: "Erreur lors de la création du compte" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Données invalides",
      errors: parsed.error.flatten(),
    });
  }

  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

export default router;
