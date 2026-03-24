import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          {/* Cercles décoratifs */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="absolute w-80 h-80 rounded-full bg-primary"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
            className="absolute w-[480px] h-[480px] rounded-full bg-primary"
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex flex-col items-center gap-5"
          >
            <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 8C15.163 8 8 15.163 8 24C8 28.418 9.791 32.418 12.686 35.314L10 42L16.686 39.314C19.418 41.009 22.6 42 26 42C34.837 42 42 34.837 42 26"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 8C36.418 8 40 11.582 40 16C40 20.418 36.418 24 32 24C27.582 24 24 20.418 24 16C24 11.582 27.582 8 32 8Z"
                  fill="white"
                  fillOpacity="0.3"
                />
                <circle cx="32" cy="16" r="4" fill="white" />
              </svg>
            </div>

            {/* Nom */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-foreground tracking-tight">
                MindCare
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ton compagnon de bien-être
              </p>
            </motion.div>
          </motion.div>

          {/* Points de chargement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="absolute bottom-20 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
