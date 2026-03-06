import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    icon: <MessageIcon />,
    title: "Parle librement",
    subtitle: "Une IA bienveillante t'écoute, sans jugement, à tout moment.",
    color: "bg-primary/10",
  },
  {
    icon: <Heart className="w-12 h-12 text-accent" />,
    title: "Suis ton humeur",
    subtitle: "Un check-in rapide chaque jour pour mieux te comprendre.",
    color: "bg-accent/10",
  },
  {
    icon: <Brain className="w-12 h-12 text-sage-foreground" />,
    title: "Retrouve le calme",
    subtitle: "Des exercices simples pour respirer, te recentrer et avancer.",
    color: "bg-sage/20",
  },
];

function MessageIcon() {
  return <Sparkles className="w-12 h-12 text-primary" />;
}

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const goNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/home");
    }
  };

  const skip = () => navigate("/home");

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 max-w-[430px] mx-auto">
      <button
        onClick={skip}
        className="self-end text-sm font-medium text-muted-foreground"
      >
        Passer
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center flex-1 justify-center gap-8"
        >
          <div
            className={`w-28 h-28 rounded-[2rem] flex items-center justify-center ${slides[step].color}`}
          >
            {slides[step].icon}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {slides[step].title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[280px]">
              {slides[step].subtitle}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full space-y-4">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
        >
          {step < slides.length - 1 ? "Continuer" : "Commencer"}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default OnboardingPage;
