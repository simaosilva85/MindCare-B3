import { motion } from "framer-motion";
import { ArrowLeft, Bell, Moon, Sun, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const TIMES = ["08:00", "09:00", "10:00", "12:00", "18:00", "20:00", "21:00"];

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [eveningEnabled, setEveningEnabled] = useState(true);

  return (
    <div className="min-h-screen pb-24 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/profil")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Rappel quotidien */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-foreground">Rappel quotidien</p>
              <p className="text-xs text-muted-foreground">Un petit rappel doux chaque jour</p>
            </div>
            <Toggle enabled={reminderEnabled} onChange={setReminderEnabled} />
          </div>

          {reminderEnabled && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Heure du rappel</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedTime === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Types de rappels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sun size={16} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Bonjour du matin</p>
              <p className="text-xs text-muted-foreground">Une intention positive pour commencer la journée</p>
            </div>
            <Toggle enabled={morningEnabled} onChange={setMorningEnabled} />
          </div>

          <div className="px-5 py-4 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Moon size={16} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Bonsoir du soir</p>
              <p className="text-xs text-muted-foreground">Un moment pour faire le bilan de ta journée</p>
            </div>
            <Toggle enabled={eveningEnabled} onChange={setEveningEnabled} />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-lavender rounded-3xl p-5"
        >
          <p className="text-sm text-foreground/70 leading-relaxed">
            Les rappels sont doux et bienveillants. Tu peux les désactiver à tout moment. Ils ne contiennent jamais de pression ou de jugement. 💜
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default NotificationsPage;
