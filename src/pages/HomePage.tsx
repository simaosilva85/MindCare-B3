import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Wind, BookOpen, Sparkles, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "@/components/MoodSelector";
import BottomNav from "@/components/BottomNav";

const tips = [
  "Prends une grande respiration. Tu mérites ce moment de pause. 🌿",
  "Chaque petit pas compte. Tu avances, même quand tu ne le vois pas. 💛",
  "Tu n'as pas besoin d'avoir toutes les réponses aujourd'hui. 🌙",
  "Prends soin de toi comme tu prendrais soin d'un ami. 🤗",
];

const HomePage = () => {
  const [mood, setMood] = useState<string>();
  const navigate = useNavigate();
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="min-h-screen pb-24 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {greeting} ✨
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">
              Comment tu vas ?
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sun size={20} className="text-primary" />
          </div>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Mood check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            Comment tu te sens ?
          </p>
          <MoodSelector selected={mood} onSelect={setMood} />
        </motion.div>

        {/* Talk CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/chat")}
          className="w-full bg-primary rounded-3xl p-5 flex items-center gap-4 shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <MessageCircle size={24} className="text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-bold text-primary-foreground text-base">
              Parler maintenant
            </p>
            <p className="text-sm text-primary-foreground/70">
              Discute avec ton compagnon IA
            </p>
          </div>
          <Sparkles
            size={20}
            className="text-primary-foreground/50 ml-auto"
          />
        </motion.button>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate("/respiration")}
            className="bg-sage/20 rounded-2xl p-4 flex flex-col items-start gap-2"
          >
            <Wind size={22} className="text-sage-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Respirer
            </span>
            <span className="text-xs text-muted-foreground">1 min · Calme</span>
          </button>
          <button
            onClick={() => navigate("/journal")}
            className="bg-lavender rounded-2xl p-4 flex flex-col items-start gap-2"
          >
            <BookOpen size={22} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Journal
            </span>
            <span className="text-xs text-muted-foreground">
              Écrire tes pensées
            </span>
          </button>
        </motion.div>

        {/* Tip of the day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-peach rounded-3xl p-5"
        >
          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
            Pensée du jour
          </p>
          <p className="text-sm text-foreground leading-relaxed">{tip}</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
