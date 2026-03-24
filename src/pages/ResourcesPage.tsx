import { motion } from "framer-motion";
import { ArrowLeft, Phone, MessageSquare, Globe, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const resources = [
  {
    title: "3114 - Numéro national de prévention du suicide",
    description: "Disponible 24h/24, 7j/7. Gratuit et confidentiel.",
    icon: Phone,
    color: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-500",
    link: "tel:3114",
  },
  {
    title: "Fil Santé Jeunes - 0 800 235 236",
    description: "Écoute, information et orientation pour les 12-25 ans. Anonyme et gratuit.",
    icon: MessageSquare,
    color: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
    link: "tel:0800235236",
  },
  {
    title: "114 - Numéro d'urgence par SMS",
    description: "Pour les personnes qui ne peuvent pas appeler. Envoyez un SMS au 114.",
    icon: MessageSquare,
    color: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-500",
    link: "sms:114",
  },
  {
    title: "Psycom - Information santé mentale",
    description: "Ressources et informations fiables sur la santé mentale.",
    icon: Globe,
    color: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
    link: "https://www.psycom.org",
  },
  {
    title: "Mon soutien psy",
    description: "Dispositif pour bénéficier de séances remboursées chez un psychologue.",
    icon: Heart,
    color: "bg-pink-100 dark:bg-pink-900/20",
    iconColor: "text-pink-500",
    link: "https://www.ameli.fr/assure/remboursements/rembourse/remboursement-seances-psychologue",
  },
];

const ResourcesPage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Ressources</h1>
        </motion.div>
      </div>

      <div className="px-5 space-y-4 mt-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          Si tu as besoin d'aide, voici des ressources gratuites et confidentielles.
        </motion.p>

        {resources.map((resource, i) => (
          <motion.a
            key={resource.title}
            href={resource.link}
            target={resource.link.startsWith("http") ? "_blank" : undefined}
            rel={resource.link.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="block bg-card rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-2xl ${resource.color} flex items-center justify-center shrink-0`}>
                <resource.icon size={20} className={resource.iconColor} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{resource.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {resource.description}
                </p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default ResourcesPage;
