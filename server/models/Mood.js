import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["good", "neutral", "sad", "stressed", "angry"],
      required: true,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
  },
  { timestamps: true }
);

// Un seul mood par jour par utilisateur
moodSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Mood", moodSchema);
