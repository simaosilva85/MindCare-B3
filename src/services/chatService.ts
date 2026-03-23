import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_XAI_API_KEY;

const SYSTEM_PROMPT = `Tu es MindCare, un compagnon bienveillant de bien-être mental pour les jeunes.

Règles importantes :
- Réponds toujours en français.
- Sois chaleureux, empathique et sans jugement.
- Utilise un ton amical et accessible (tutoiement).
- Tes réponses doivent être concises (2-4 phrases max) sauf si l'utilisateur demande plus de détails.
- Tu peux proposer des exercices simples (respiration, ancrage) quand c'est pertinent.
- Tu n'es PAS un professionnel de santé. Si quelqu'un exprime des pensées suicidaires ou une détresse grave, oriente-le vers le 3114 (numéro national de prévention du suicide) ou le 114 par SMS.
- Ne pose pas de diagnostic. Tu es un espace d'écoute et de soutien.
- Tu peux utiliser des emojis avec modération pour rendre la conversation plus chaleureuse.`;

let client: OpenAI | null = null;
let conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

function getClient(): OpenAI {
  if (!client) {
    if (!API_KEY) {
      throw new Error("Clé API xAI manquante. Ajoute VITE_XAI_API_KEY dans .env.local");
    }
    client = new OpenAI({
      apiKey: API_KEY,
      baseURL: "https://api.x.ai/v1",
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export function startNewChat(): void {
  conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
}

export async function sendMessageToAI(message: string): Promise<string> {
  if (conversationHistory.length === 0) {
    startNewChat();
  }

  conversationHistory.push({ role: "user", content: message });

  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: "grok-3-mini-fast",
    messages: conversationHistory,
  });

  const assistantMessage = response.choices[0]?.message?.content ?? "";
  conversationHistory.push({ role: "assistant", content: assistantMessage });

  return assistantMessage;
}

export function resetChat(): void {
  conversationHistory = [];
  client = null;
}
