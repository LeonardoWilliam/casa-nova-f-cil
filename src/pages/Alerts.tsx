import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile, FinancialProfile, getSmartAlerts, Alert,
  getFinancialTimeline, TimelineEvent, getActivityLog, ActivityEntry,
} from "@/lib/financial-store";
import { ArrowLeft, Bell, Clock, Activity } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const TYPE_STYLES = {
  warning: "bg-destructive/5 border-destructive/20",
  tip: "bg-primary/5 border-primary/20",
  reminder: "bg-secondary/5 border-secondary/20",
};

const TL_STYLES = {
  transaction: "bg-secondary/10 border-secondary/30",
  milestone: "bg-primary/10 border-primary/30",
  achievement: "bg-warning/10 border-warning/30",
};

export default function Alerts() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [tab, setTab] = useState<"alertas" | "timeline" | "historico">("alertas");

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const alerts = getSmartAlerts(profile);
  const timeline = getFinancialTimeline(profile);
  const activities = getActivityLog();

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
            <h1 className="text-lg font-bold text-primary-foreground">Alertas & Histórico</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["alertas", "timeline", "historico"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {t === "alertas" ? "🔔 Alertas" : t === "timeline" ? "📈 Timeline" : "📋 Atividades"}
            </button>
          ))}
        </div>

        {tab === "alertas" && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-foreground font-medium">Tudo certo por aqui!</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
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
        )}

        {tab === "timeline" && (
          <div className="space-y-1">
            {timeline.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Sua linha do tempo está vazia</p>
                <p className="text-xs text-muted-foreground mt-1">Registre transações para ver sua evolução</p>
              </div>
            ) : (
              timeline.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${TL_STYLES[event.type]}`}>
                      {event.emoji}
                    </div>
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-semibold text-foreground text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(event.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "historico" && (
          <div className="space-y-2">
            {activities.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
                <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Nenhuma atividade registrada</p>
              </div>
            ) : (
              activities.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleString("pt-BR")}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
