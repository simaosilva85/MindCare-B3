import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const articles = [
  {
    title: "1. Éditeur",
    body: "MindCare est un projet étudiant développé dans le cadre d'un cursus académique. Il n'est pas exploité à titre commercial. Pour toute question, contactez-nous à contact@mindcare.app.",
  },
  {
    title: "2. Objet",
    body: "MindCare est une application d'aide au bien-être mental destinée aux jeunes. Elle propose un espace d'expression, de suivi de l'humeur et d'accompagnement bienveillant par intelligence artificielle.",
  },
  {
    title: "3. Avertissement",
    body: "MindCare n'est pas un dispositif médical ni un substitut à un professionnel de santé mentale. En cas de détresse psychologique, contactez le 3114 (numéro national de prévention du suicide) ou rendez-vous aux urgences.",
  },
  {
    title: "4. Propriété intellectuelle",
    body: "L'ensemble des contenus (textes, illustrations, interface) est la propriété exclusive de l'équipe MindCare. Toute reproduction sans autorisation est interdite.",
  },
  {
    title: "5. Données personnelles",
    body: "Conformément au Règlement Général sur la Protection des Données (RGPD), tu disposes d'un droit d'accès, de rectification et de suppression de tes données. Pour l'exercer, contacte privacy@mindcare.app.",
  },
  {
    title: "6. Responsabilité",
    body: "L'équipe MindCare s'efforce d'assurer l'exactitude des informations diffusées. Cependant, elle ne peut garantir l'exhaustivité et la complétude des informations. MindCare ne saurait être tenu responsable d'un usage inapproprié de l'application.",
  },
  {
    title: "7. Droit applicable",
    body: "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.",
  },
];

const MentionsLegalesPage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Mentions légales</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-4 mt-4">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dernière mise à jour : mars 2025
          </p>
        </motion.div>

        {/* Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl shadow-sm overflow-hidden"
        >
          {articles.map((a, i) => (
            <div
              key={i}
              className="px-5 py-4 border-b border-border/30 last:border-b-0"
            >
              <p className="text-sm font-bold text-foreground mb-1">{a.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
            </div>
          ))}
        </motion.div>

        {/* Urgence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-peach rounded-3xl p-5"
        >
          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Urgence</p>
          <p className="text-sm text-foreground leading-relaxed">
            En cas de détresse, appelle le <span className="font-bold">3114</span> (gratuit, 24h/24) ou envoie un SMS au <span className="font-bold">114</span>.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MentionsLegalesPage;
