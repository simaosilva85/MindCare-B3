import { useState, useCallback, useEffect, useRef } from "react";
import { sendMessageToAI, startNewChat, resetChat, loadHistory } from "@/services/chatService";
import { getToken } from "@/services/authService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content:
    "Salut 👋 Je suis là pour toi. Comment tu te sens en ce moment ? Tu peux me dire ce qui te passe par la tête, ou choisir une suggestion en dessous.",
};

const API_BASE = import.meta.env.PROD
  ? "https://mindcare-b3.onrender.com/api"
  : "http://localhost:5001/api";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([WELCOME_MESSAGE]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    startNewChat();

    const token = getToken();
    if (token) {
      fetch(`${API_BASE}/chat-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            const loaded: Message[] = data.messages.map((m: any, i: number) => ({
              id: (i + 1).toString(),
              role: m.role,
              content: m.content,
            }));
            // Restore Gemini conversation history
            loadHistory(loaded);
            setMessages([WELCOME_MESSAGE, ...loaded]);
          }
        })
        .catch(() => {});
    }

    return () => {
      resetChat();
    };
  }, []);

  // No beforeunload needed — chat is saved after each AI response

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await sendMessageToAI(text.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save after each AI response
      const token = getToken();
      if (token) {
        const allMessages = [...messagesRef.current, userMsg, aiMsg].filter((m) => m.id !== "1");
        fetch(`${API_BASE}/chat-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        }).catch(() => {});
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Désolé, je rencontre un problème technique. Réessaie dans un instant. 🙏",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  return { messages, isTyping, error, sendMessage };
}
