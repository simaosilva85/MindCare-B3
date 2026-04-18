const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

type HistoryEntry = { role: "user" | "model"; parts: Array<{ text: string }> };

let conversationHistory: HistoryEntry[] = [];

export function startNewChat(): void {
  conversationHistory = [];
}

export function resetChat(): void {
  conversationHistory = [];
}

export async function sendMessageToAI(message: string): Promise<string> {
  conversationHistory.push({ role: "user", parts: [{ text: message }] });

  const token = localStorage.getItem("token");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ history: conversationHistory }),
    });
  } catch (err) {
    conversationHistory.pop();
    throw new Error("Impossible de joindre le serveur");
  }

  if (!res.ok) {
    conversationHistory.pop();
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erreur serveur");
  }

  const { text } = (await res.json()) as { text: string };
  conversationHistory.push({ role: "model", parts: [{ text }] });
  return text;
}
