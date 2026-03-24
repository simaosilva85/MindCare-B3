import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Heart,
  Palette,
  Pencil,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getJournalEntries } from "@/services/journalService";
import { getMoods } from "@/services/moodService";

const menuItems = [
  { icon: Palette, label: "Thème", sub: "Mode clair / sombre", action: "theme" },
  { icon: Bell, label: "Notifications", sub: "Rappels doux" },
  { icon: Shield, label: "Confidentialité", sub: "Tes données sont protégées" },
  { icon: FileText, label: "Mentions légales", sub: "" },
  { icon: Heart, label: "À propos de MindCare", sub: "" },
];

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort((a, b) => (a > b ? -1 : 1));
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let expected = today;
  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    } else if (date < expected) {
      break;
    }
  }
  return streak;
}

const ProfilPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ checkins: 0, streak: 0, notes: 0 });

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getMoods(), getJournalEntries()]).then(([moods, journal]) => {
      setStats({
        checkins: moods.length,
        streak: computeStreak(moods.map((m) => m.date)),
        notes: journal.length,
      });
    });
  }, []);

  const openEdit = () => {
    setForm({ name: user?.name || "", email: user?.email || "", password: "", confirmPassword: "" });
    setEditError("");
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      setEditError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password && form.password.length < 6) {
      setEditError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      const payload: { name?: string; email?: string; password?: string } = {};
      if (form.name && form.name !== user?.name) payload.name = form.name;
      if (form.email && form.email !== user?.email) payload.email = form.email;
      if (form.password) payload.password = form.password;
      if (Object.keys(payload).length > 0) await updateUser(payload);
      setShowEdit(false);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">{user?.name || "Utilisateur"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={openEdit}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Pencil size={15} className="text-primary" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: stats.checkins, label: "Check-ins" },
            { value: stats.streak, label: "Jours streak" },
            { value: stats.notes, label: "Notes journal" },
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
                <p className="text-sm font-medium text-foreground">{item.label}</p>
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

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowEdit(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-w-[430px] mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Modifier le profil</h2>
                <button onClick={() => setShowEdit(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nouveau mot de passe <span className="text-muted-foreground/60">(optionnel)</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Laisser vide pour ne pas changer"
                      className="w-full rounded-xl bg-muted px-4 py-3 pr-11 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {form.password && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmer le mot de passe</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}

                {editError && (
                  <p className="text-xs text-destructive">{editError}</p>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilPage;
