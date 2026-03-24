import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Database, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const sections = [
  {
    icon: Lock,
    color: "bg-primary/10",
    iconColor: "text-primary",
    title: "Chiffrement de bout en bout",
    body: "Toutes tes données sont chiffrées en transit (HTTPS/TLS) et au repos. Personne, pas même notre équipe, ne peut lire tes conversations.",
  },
  {
    icon: Database,
    color: "bg-sage/20",
    iconColor: "text-emerald-600",
    title: "Stockage sécurisé",
    body: "Tes informations sont hébergées sur des serveurs sécurisés. Ton journal, tes humeurs et tes messages ne sont accessibles que depuis ton compte.",
  },
  {
    icon: Eye,
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
    title: "Aucun partage avec des tiers",
    body: "MindCare ne vend pas et ne partage pas tes données avec des annonceurs ou des tiers. Tes informations restent chez nous, pour toi.",
  },
  {
    icon: Trash2,
    color: "bg-destructive/10",
    iconColor: "text-destructive",
    title: "Droit à l'effacement",
    body: "Tu peux demander la suppression complète de ton compte et de toutes tes données à tout moment en nous contactant. Nous traiterons ta demande sous 7 jours.",
  },
];

const ConfidentialitePage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Confidentialité</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield size={24} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tes données sont protégées. Ta confiance est notre priorité absolue.
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="bg-card rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center`}>
                <s.icon size={18} className={s.iconColor} />
              </div>
              <p className="text-sm font-bold text-foreground">{s.title}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </motion.div>
        ))}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-lavender rounded-3xl p-5"
        >
          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Contact</p>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Pour toute question relative à tes données personnelles, contacte-nous à{" "}
            <span className="text-primary font-medium">privacy@mindcare.app</span>
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ConfidentialitePage;
