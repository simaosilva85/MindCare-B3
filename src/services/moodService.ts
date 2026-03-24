import { getToken } from "./authService";

const API_BASE = import.meta.env.PROD
  ? "https://mindcare-b3.onrender.com/api/mood"
  : "http://localhost:5001/api/mood";

const moodValues: Record<string, number> = {
  good: 4,
  neutral: 3,
  sad: 2,
  stressed: 1,
  angry: 1,
};

const moodEmojis: Record<string, string> = {
  good: "😊",
  neutral: "😐",
  sad: "😔",
  stressed: "😰",
  angry: "😡",
};

export interface MoodEntry {
  mood: string;
  date: string;
}

export async function saveMood(mood: string): Promise<void> {
  const token = getToken();
  if (!token) return;
  const date = new Date().toISOString().split("T")[0];
  await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, date }),
  });
}

export async function getMoods(): Promise<MoodEntry[]> {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export function getMoodValue(mood: string): number {
  return moodValues[mood] ?? 3;
}

export function getMoodEmoji(mood: string): string {
  return moodEmojis[mood] ?? "😐";
}
