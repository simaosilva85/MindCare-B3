import express from "express";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const MAX_HISTORY = 50;
const MAX_MESSAGE_LENGTH = 2000;

const SYSTEM_INSTRUCTION = `Tu es MindCare, un compagnon bienveillant de bien-être mental pour les jeunes.

Règles importantes :
- Réponds toujours en français.
- Sois chaleureux, empathique et sans jugement.
- Utilise un ton amical et accessible (tutoiement).
- Tes réponses doivent être concises (2-4 phrases max) sauf si l'utilisateur demande plus de détails.
- Tu peux proposer des exercices simples (respiration, ancrage) quand c'est pertinent.
- Tu n'es PAS un professionnel de santé. Si quelqu'un exprime des pensées suicidaires ou une détresse grave, oriente-le vers le 3114 (numéro national de prévention du suicide) ou le 114 par SMS.
- Ne pose pas de diagnostic. Tu es un espace d'écoute et de soutien.
- Tu peux utiliser des emojis avec modération pour rendre la conversation plus chaleureuse.`;

const chatSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z
          .array(z.object({ text: z.string().min(1).max(MAX_MESSAGE_LENGTH) }))
          .min(1),
      })
    )
    .min(1)
    .max(MAX_HISTORY),
});

let aiInstance = null;
function getAi() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY absent côté serveur");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

router.post("/", protect, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Requête invalide",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: parsed.data.history,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    res.json({ text: response.text ?? "" });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(502).json({ message: "Service IA indisponible" });
  }
});

export default router;
