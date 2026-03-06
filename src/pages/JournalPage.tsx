import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
}

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: "Aujourd'hui",
    mood: "😊",
    content: "Bonne journée, j'ai pris le temps de marcher dehors. Ça m'a fait du bien de déconnecter un peu.",
  },
  {
    id: "2",
    date: "Hier",
    mood: "😐",
    content: "Journée un peu longue au travail. J'ai du mal à lâcher prise le soir.",
  },
  {
    id: "3",
    date: "Lundi",
    mood: "😔",
    content: "Je me suis senti un peu seul aujourd'hui. J'ai appelé un ami, ça m'a aidé.",
  },
];

const moodOptions = ["😊", "😐", "😔", "😰", "😡"];

const JournalPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newMood, setNewMood] = useState("😊");

  const addEntry = () => {
    if (!newContent.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: "Aujourd'hui",
      mood: newMood,
      content: newContent.trim(),
    };
    setEntries([entry, ...entries]);
    setNewContent("");
    setShowNew(false);
  };

  return (
    <div className="min-h-screen pb-8 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Mon journal</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNew(true)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
        >
          <Plus size={20} className="text-primary-foreground" />
        </motion.button>
      </div>

      {/* New entry */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 mb-4 overflow-hidden"
          >
            <div className="bg-card rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Nouvelle entrée
                </p>
                <button onClick={() => setShowNew(false)}>
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-2 mb-3">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setNewMood(m)}
                    className={`text-xl p-1.5 rounded-xl transition-all ${
                      newMood === m ? "bg-primary/10 scale-110" : ""
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Qu'est-ce qui te passe par la tête ?"
                rows={3}
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addEntry}
                disabled={!newContent.trim()}
                className="w-full mt-3 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40"
              >
                Enregistrer
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="px-5 space-y-3">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                {entry.date}
              </span>
              <span className="text-lg">{entry.mood}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {entry.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;
