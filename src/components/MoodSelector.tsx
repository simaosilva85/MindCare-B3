import { motion } from "framer-motion";

const moods = [
  { emoji: "😊", label: "Bien", value: "good", color: "bg-sage/30" },
  { emoji: "😐", label: "Bof", value: "neutral", color: "bg-lavender" },
  { emoji: "😔", label: "Triste", value: "sad", color: "bg-secondary" },
  { emoji: "😰", label: "Stressé", value: "stressed", color: "bg-peach" },
  { emoji: "😡", label: "Enervé", value: "angry", color: "bg-accent/20" },
];

interface MoodSelectorProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const MoodSelector = ({ selected, onSelect }: MoodSelectorProps) => {
  return (
    <div className="flex items-center justify-between gap-2">
      {moods.map((mood) => (
        <motion.button
          key={mood.value}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelect(mood.value)}
          className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl transition-all flex-1 ${
            selected === mood.value
              ? "bg-primary/15 ring-2 ring-primary/30"
              : mood.color
          }`}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-[11px] font-medium text-foreground/70">
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default MoodSelector;
