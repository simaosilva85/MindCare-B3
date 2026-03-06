import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Je me sens stressé(e)",
  "J'ai besoin de parler",
  "Aide-moi à me calmer",
  "Je me sens perdu(e)",
  "Je veux vider ma tête",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Salut 👋 Je suis là pour toi. Comment tu te sens en ce moment ? Tu peux me dire ce qui te passe par la tête, ou choisir une suggestion en dessous.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI response (will be replaced with real API)
    setTimeout(() => {
      const responses = [
        "Je comprends ce que tu ressens. C'est normal de se sentir comme ça parfois. Prends une grande respiration avec moi. 🌿\n\nEst-ce que tu veux qu'on en parle un peu plus, ou tu préfères un petit exercice pour te calmer ?",
        "Merci de partager ça avec moi. Ce que tu vis est valide. Tu n'as pas besoin d'avoir toutes les réponses maintenant.\n\nUne chose simple que tu peux essayer : ferme les yeux 10 secondes et respire profondément. Comment tu te sens après ?",
        "Je suis là pour toi, sans jugement. 💛 Parfois, juste mettre des mots sur ce qu'on ressent aide déjà un peu.\n\nQu'est-ce qui te pèse le plus en ce moment ?",
      ];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col max-w-[430px] mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">MindCare</p>
            <p className="text-xs text-muted-foreground">
              Ton compagnon bien-être
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground shadow-sm rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        {/* Quick prompts - show when few messages */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="bg-lavender text-foreground text-xs font-medium px-3.5 py-2 rounded-full transition-all active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-card/80 backdrop-blur-xl border-t border-border/50 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-muted rounded-2xl px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Écris ce que tu ressens..."
              rows={1}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-24"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send size={18} className="text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
