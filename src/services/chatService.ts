import { GoogleGenerativeAI, type ChatSession } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

let chatSession: ChatSession | null = null;

export function startNewChat(): void {
  if (!API_KEY) {
    throw new Error("Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY dans .env.local");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  chatSession = model.startChat({ history: [] });
}

export async function sendMessageToAI(message: string): Promise<string> {
  if (!chatSession) {
    startNewChat();
  }

  const result = await chatSession!.sendMessage(message);
  return result.response.text();
}

export function resetChat(): void {
  chatSession = null;
}
