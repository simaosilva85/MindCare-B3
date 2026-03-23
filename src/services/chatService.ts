const API_URL = import.meta.env.PROD
  ? "https://mindcare-b3.onrender.com/api/chat"
  : "http://localhost:5001/api/chat";

let conversationHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

export function startNewChat(): void {
  conversationHistory = [];
}

export async function sendMessageToAI(message: string): Promise<string> {
  conversationHistory.push({
    role: "user",
    parts: [{ text: message }],
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversationHistory }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  const text = data.text;

  conversationHistory.push({
    role: "model",
    parts: [{ text }],
  });

  return text;
}

export function resetChat(): void {
  conversationHistory = [];
}
