import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Heart,
  Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { icon: Palette, label: "Thème", sub: "Mode clair / sombre", action: "theme" },
  { icon: Bell, label: "Notifications", sub: "Rappels doux" },
  { icon: Shield, label: "Confidentialité", sub: "Tes données sont protégées" },
  { icon: FileText, label: "Mentions légales", sub: "" },
  { icon: Heart, label: "À propos de MindCare", sub: "" },
];

const ProfilPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen pb-24 max-w-[430px] mx-auto">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={28} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{user?.name || "Utilisateur"}</p>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: "24", label: "Check-ins" },
            { value: "5", label: "Jours streak" },
            { value: "12", label: "Notes journal" },
          ].map((s, i) => (
            <div key={i} className="bg-lavender rounded-2xl p-3.5 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl shadow-sm overflow-hidden"
        >
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3.5 px-5 py-4 border-b border-border/30 last:border-b-0 text-left hover:bg-accent/50 transition-colors"
            >
              <item.icon size={18} className="text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                {item.sub && (
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                )}
              </div>
              {item.action === "theme" ? (
                <ThemeToggle />
              ) : (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors"
        >
          <LogOut size={16} />
          Se déconnecter
        </motion.button>

        <p className="text-center text-xs text-muted-foreground pb-4">
          MindCare v1.0 · Fait avec 💜
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilPage;
