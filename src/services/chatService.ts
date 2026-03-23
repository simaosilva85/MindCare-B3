import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyDmQ9XhsXVzXobTsfRoBmYHDX2L9FsZI3s";

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

let ai: GoogleGenAI | null = null;
let conversationHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

function getAI(): GoogleGenAI {
  if (!ai) {
    if (!API_KEY) {
      throw new Error("Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY dans .env.local");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export function startNewChat(): void {
  conversationHistory = [];
}

export async function sendMessageToAI(message: string): Promise<string> {
  const client = getAI();

  conversationHistory.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = await client.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: conversationHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  const text = response.text ?? "";

  conversationHistory.push({
    role: "model",
    parts: [{ text }],
  });

  return text;
}

export function resetChat(): void {
  conversationHistory = [];
  ai = null;
}
