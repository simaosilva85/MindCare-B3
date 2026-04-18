import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS — origines autorisées via CORS_ORIGIN (liste séparée par virgules)
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8080")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origine CORS non autorisée"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

// Rate-limit global pour l'auth (brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessaie dans quelques minutes." },
});

// Rate-limit pour le chat (quota/coût)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de messages, ralentis un peu." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI manquant dans .env");
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "mindcare_secret_key_change_me") {
  console.error("JWT_SECRET manquant ou défaut — générer un secret fort (openssl rand -hex 64)");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur MongoDB:", err.message);
    process.exit(1);
  });
