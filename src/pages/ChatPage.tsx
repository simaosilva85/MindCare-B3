import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";

const quickPrompts = [
  "Je me sens stressé(e)",
  "J'ai besoin de parler",
  "Aide-moi à me calmer",
  "Je me sens perdu(e)",
  "Je veux vider ma tête",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const { messages, isTyping, sendMessage } = useChat();
  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking, isSupported } = useVoice();
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Auto-speak new AI messages when voice mode is ON
  useEffect(() => {
    if (!voiceMode || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && lastMsg.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = lastMsg.id;
      speak(lastMsg.content, () => {
        // After AI finishes speaking, auto-listen for next user input
        startListening((text) => {
          handleSend(text);
        });
      });
    }
  }, [messages, voiceMode]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInput("");
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        handleSend(text);
      });
    }
  };

  const toggleVoiceMode = () => {
    if (voiceMode) {
      setVoiceMode(false);
      stopSpeaking();
      stopListening();
    } else {
      setVoiceMode(true);
      // Start listening immediately
      startListening((text) => {
        handleSend(text);
      });
    }
  };

  return (
    <div className="h-screen flex flex-col max-w-[430px] mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src="/mindcare-logo.svg"
                alt="Logo Mind Care"
                className="w-7 h-7 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">MindCare</p>
              <p className="text-xs text-muted-foreground">
                {voiceMode ? "Mode vocal activé" : "Ton compagnon bien-être"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSupported && (
            <button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-full transition-colors ${
                voiceMode ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Voice mode banner */}
      {voiceMode && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-primary/10 px-4 py-2 text-center text-xs text-primary font-medium"
        >
          {isSpeaking
            ? "🔊 MindCare parle..."
            : isListening
              ? "🎙️ Je t'écoute, parle..."
              : isTyping
                ? "💭 MindCare réfléchit..."
                : "🎙️ Appuie sur le micro ou parle"}
        </motion.div>
      )}

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
                {msg.role === "assistant" && isSupported && !voiceMode && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Volume2 size={14} className={isSpeaking ? "text-primary animate-pulse" : ""} />
                    {isSpeaking ? "Stop" : "Écouter"}
                  </button>
                )}
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
                onClick={() => handleSend(prompt)}
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
                  handleSend(input);
                }
              }}
              placeholder={isListening ? "Parle, je t'écoute..." : "Écris ce que tu ressens..."}
              rows={1}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-24"
            />
          </div>
          {isSupported && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMic}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-transparent border border-border transition-colors"
            >
              {isListening ? (
                <Mic size={18} className="text-primary" />
              ) : (
                <MicOff size={18} className="text-red-500" />
              )}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend(input)}
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
