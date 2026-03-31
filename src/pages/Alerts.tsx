import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProfile, FinancialProfile, getAlerts, Alert } from "@/lib/financial-store";
import { ArrowLeft, Bell } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const TYPE_STYLES = {
  warning: "bg-destructive/5 border-destructive/20",
  tip: "bg-primary/5 border-primary/20",
  reminder: "bg-secondary/5 border-secondary/20",
};

export default function Alerts() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const alerts = getAlerts(profile);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-primary-foreground">Alertas</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-foreground font-medium">Tudo certo por aqui!</p>
            <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-2xl p-4 shadow-md border ${TYPE_STYLES[alert.type]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{alert.icon}</span>
                <p className="text-sm text-foreground flex-1">{alert.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
