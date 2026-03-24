import { motion } from "framer-motion";
import { ArrowLeft, Heart, Shield, Users, Sparkles, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const features = [
  {
    icon: Sparkles,
    color: "bg-primary/10",
    iconColor: "text-primary",
    title: "IA bienveillante",
    body: "Notre assistant IA est entraîné pour écouter sans juger, avec douceur et empathie. Il ne remplace pas un humain, mais il est toujours disponible.",
  },
  {
    icon: Heart,
    color: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-500",
    title: "Suivi de l'humeur",
    body: "Prends 30 secondes chaque jour pour noter comment tu te sens. Au fil du temps, tu découvres des tendances et tu te comprends mieux.",
  },
  {
    icon: Shield,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
    title: "100 % privé",
    body: "Tes données ne sont jamais vendues ni partagées. Tout ce que tu écris reste entre toi et l'application.",
  },
  {
    icon: Users,
    color: "bg-lavender",
    iconColor: "text-primary",
    title: "L'équipe",
    body: "MindCare est né d'un projet étudiant porté par des personnes qui croient que le soutien mental devrait être accessible à tous, partout.",
  },
];

const AProposPage = () => {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold text-foreground">À propos</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Logo card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-sm text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Heart size={28} className="text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">MindCare</p>
          <p className="text-xs text-muted-foreground mt-1">Version 1.0</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Un compagnon de bien-être mental pour les jeunes. Disponible 24h/24, sans jugement, toujours à l'écoute.
          </p>
        </motion.div>

        {/* Features */}
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="bg-card rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-2xl ${f.color} flex items-center justify-center`}>
                <f.icon size={18} className={f.iconColor} />
              </div>
              <p className="text-sm font-bold text-foreground">{f.title}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </motion.div>
        ))}

        {/* Urgence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-peach rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Phone size={14} className="text-foreground/50" />
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">En cas de détresse</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            MindCare ne remplace pas un professionnel. En cas d'urgence, appelle le <span className="font-bold">3114</span> (gratuit, 24h/24) ou le <span className="font-bold">15</span> (SAMU).
          </p>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground pb-2">
          Fait avec 💜 par l'équipe MindCare
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default AProposPage;
