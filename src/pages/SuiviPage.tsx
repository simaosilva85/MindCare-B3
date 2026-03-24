import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, BookOpen, Plus } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { saveMood, getMoods, getMoodValue, getMoodEmoji, MoodEntry } from "@/services/moodService";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function getLast7Days(): { date: string; day: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      day: DAY_LABELS[d.getDay()],
    });
  }
  return days;
}

const SuiviPage = () => {
  const [todayMood, setTodayMood] = useState<string>();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const last7 = getLast7Days();

  useEffect(() => {
    getMoods().then((entries) => {
      setMoodHistory(entries);
      const todayEntry = entries.find((e) => e.date === today);
      if (todayEntry) setTodayMood(todayEntry.mood);
    });
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setTodayMood(mood);
    await saveMood(mood);
    setMoodHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      return [{ mood, date: today }, ...filtered];
    });
  };

  // Stats calculées
  const totalDays = moodHistory.length;
  const goodDays = moodHistory.filter((e) => e.mood === "good" || e.mood === "neutral").length;
  const avgMoodValue = totalDays > 0
    ? moodHistory.reduce((sum, e) => sum + getMoodValue(e.mood), 0) / totalDays
    : 0;
  const avgEmoji = avgMoodValue >= 3.5 ? "😊" : avgMoodValue >= 2.5 ? "😐" : "😔";

  // Streak
  let streak = 0;
  const sortedDates = moodHistory.map((e) => e.date).sort((a, b) => b.localeCompare(a));
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (sortedDates[i] === expected.toISOString().split("T")[0]) {
      streak++;
    } else break;
  }

  const moodMap: Record<string, MoodEntry> = {};
  moodHistory.forEach((e) => { moodMap[e.date] = e; });

  return (
    <div className="min-h-screen pb-24 max-w-[430px] mx-auto">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ton suivi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Observe tes tendances et prends soin de toi
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Today's mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">Aujourd'hui</p>
          </div>
          <MoodSelector selected={todayMood} onSelect={handleMoodSelect} />
        </motion.div>

        {/* Week overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">Cette semaine</p>
          </div>
          <div className="flex items-end justify-between gap-1">
            {last7.map((d, i) => {
              const entry = moodMap[d.date];
              const value = entry ? getMoodValue(entry.mood) : 0;
              const emoji = entry ? getMoodEmoji(entry.mood) : "·";
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full rounded-xl bg-primary/10 transition-all"
                    style={{ height: `${Math.max(value * 16, entry ? 8 : 4)}px` }}
                  />
                  <span className="text-lg">{emoji}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Journal shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/journal")}
          className="w-full bg-lavender rounded-3xl p-5 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-foreground text-sm">Mon journal</p>
            <p className="text-xs text-muted-foreground">Écrire tes pensées</p>
          </div>
          <Plus size={18} className="text-muted-foreground" />
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Jours actifs", value: totalDays.toString(), sub: "au total" },
            { label: "Humeur moy.", value: avgEmoji, sub: avgMoodValue >= 3 ? "positive" : "à améliorer" },
            { label: "Streak", value: streak.toString(), sub: "jours" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl p-3.5 text-center shadow-sm">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SuiviPage;
