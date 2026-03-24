import { getToken } from "./authService";

const API_BASE = import.meta.env.PROD
  ? "https://mindcare-b3.onrender.com/api/journal"
  : "http://localhost:5001/api/journal";

export interface JournalEntry {
  _id: string;
  mood: string;
  content: string;
  createdAt: string;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createJournalEntry(mood: string, content: string): Promise<JournalEntry | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, content }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
