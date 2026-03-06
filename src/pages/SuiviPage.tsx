import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, BookOpen, Plus } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const moodHistory = [
  { day: "Lun", emoji: "😊", value: 4 },
  { day: "Mar", emoji: "😐", value: 3 },
  { day: "Mer", emoji: "😔", value: 2 },
  { day: "Jeu", emoji: "😊", value: 4 },
  { day: "Ven", emoji: "😰", value: 1 },
  { day: "Sam", emoji: "😊", value: 4 },
  { day: "Dim", emoji: "😐", value: 3 },
];

const SuiviPage = () => {
  const [todayMood, setTodayMood] = useState<string>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 max-w-[430px] mx-auto">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Ton suivi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Observe tes tendances et prends soin de toi
        </p>
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
          <MoodSelector selected={todayMood} onSelect={setTodayMood} />
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
            <p className="text-sm font-semibold text-foreground">
              Cette semaine
            </p>
          </div>
          <div className="flex items-end justify-between gap-1">
            {moodHistory.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full rounded-xl bg-primary/10 transition-all"
                  style={{ height: `${day.value * 16}px` }}
                />
                <span className="text-lg">{day.emoji}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {day.day}
                </span>
              </div>
            ))}
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
            <p className="font-semibold text-foreground text-sm">
              Mon journal
            </p>
            <p className="text-xs text-muted-foreground">
              3 entrées cette semaine
            </p>
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
            { label: "Jours actifs", value: "12", sub: "ce mois" },
            { label: "Humeur moy.", value: "😊", sub: "positive" },
            { label: "Streak", value: "5", sub: "jours" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-3.5 text-center shadow-sm"
            >
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                {stat.label}
              </p>
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
