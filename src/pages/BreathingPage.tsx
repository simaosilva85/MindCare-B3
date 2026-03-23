import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const exercises = [
  { id: "calm", name: "Respiration calme", duration: 60, inhale: 4, hold: 4, exhale: 4 },
  { id: "stress", name: "Anti-stress", duration: 60, inhale: 4, hold: 7, exhale: 8 },
  { id: "focus", name: "Recentrage", duration: 90, inhale: 5, hold: 5, exhale: 5 },
];

const BreathingPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(exercises[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(selected.duration);

  useEffect(() => {
    if (!isActive) return;

    const cycle = selected.inhale + selected.hold + selected.exhale;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed++;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });

      const pos = elapsed % cycle;
      if (pos < selected.inhale) setPhase("inhale");
      else if (pos < selected.inhale + selected.hold) setPhase("hold");
      else setPhase("exhale");
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, selected]);

  const reset = () => {
    setIsActive(false);
    setTimeLeft(selected.duration);
    setPhase("inhale");
  };

  const phaseLabel =
    phase === "inhale" ? "Inspire..." : phase === "hold" ? "Retiens..." : "Expire...";

  const circleScale =
    phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : 1;

  return (
    <div className="min-h-screen flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Respiration</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Exercise selector */}
      <div className="flex gap-2 px-5 mb-8">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => {
              setSelected(ex);
              reset();
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
              selected.id === ex.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-5">
        <div className="relative">
          <motion.div
            animate={{ scale: isActive ? circleScale : 1 }}
            transition={{ duration: phase === "hold" ? 0.3 : phase === "inhale" ? selected.inhale : selected.exhale, ease: "easeInOut" }}
            className="w-44 h-44 rounded-full bg-primary/15 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: isActive ? circleScale : 1 }}
              transition={{ duration: phase === "hold" ? 0.3 : phase === "inhale" ? selected.inhale : selected.exhale, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full bg-primary/25 flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/40 flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <p className="text-lg font-semibold text-foreground">
          {isActive ? phaseLabel : "Prêt ?"}
        </p>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            {isActive ? (
              <Pause size={24} className="text-primary-foreground" />
            ) : (
              <Play size={24} className="text-primary-foreground ml-0.5" />
            )}
          </motion.button>
          {timeLeft < selected.duration && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
            >
              <RotateCcw size={18} className="text-muted-foreground" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingPage;
