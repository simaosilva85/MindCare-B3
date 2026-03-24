import { motion } from "framer-motion";
import { ArrowLeft, Heart, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const AboutPage = () => {
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
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">À propos</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Heart size={20} className="text-primary" />
            </div>
            <p className="text-base font-bold text-foreground">Notre mission</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MindCare est un compagnon de bien-être mental conçu pour les jeunes. Notre objectif est d'offrir un espace d'écoute bienveillant et accessible à tous, à tout moment.
          </p>
        </motion.div>

        {/* Confidentialité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sage/20 flex items-center justify-center">
              <Shield size={20} className="text-sage-foreground" />
            </div>
            <p className="text-base font-bold text-foreground">Confidentialité</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tes conversations sont privées et sécurisées. Nous ne partageons jamais tes données personnelles avec des tiers. Ton bien-être et ta vie privée sont notre priorité.
          </p>
        </motion.div>

        {/* Équipe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <p className="text-base font-bold text-foreground">L'équipe</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MindCare est un projet développé par des étudiants passionnés, soucieux de rendre le soutien mental plus accessible aux jeunes grâce à l'intelligence artificielle.
          </p>
        </motion.div>

        {/* Avertissement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-peach rounded-3xl p-5"
        >
          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
            Important
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            MindCare n'est pas un substitut à un professionnel de santé mentale. En cas de détresse, contacte le 3114 (numéro national de prévention du suicide) ou le 114 par SMS.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AboutPage;
