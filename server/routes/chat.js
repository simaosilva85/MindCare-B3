import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

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

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages requis" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text ?? "";
    res.json({ text });
  } catch (err) {
    console.error("Erreur Gemini:", err.message);
    res.status(500).json({ message: "Erreur lors de la génération de la réponse" });
  }
});

export default router;
