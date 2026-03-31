import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getProfile, saveProfile, FinancialProfile } from "@/lib/financial-store";
import { ArrowLeft, Flame, Check, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function Discipline() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const today = new Date().toISOString().split("T")[0];
  const isActive = profile.disciplinaAtiva;
  const checkins = profile.disciplinaCheckins || [];
  const todayChecked = checkins.includes(today);
  const startDate = profile.disciplinaDiaInicio ? new Date(profile.disciplinaDiaInicio) : null;
  const dayNumber = startDate
    ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;
  const streak = checkins.length;

  const handleStart = () => {
    const updated = { ...profile, disciplinaAtiva: true, disciplinaDiaInicio: today, disciplinaCheckins: [] };
    saveProfile(updated);
    setProfile(updated);
  };

  const handleCheckin = () => {
    if (todayChecked) return;
    const updated = { ...profile, disciplinaCheckins: [...checkins, today] };
    saveProfile(updated);
    setProfile(updated);
  };

  // Generate 90-day grid
  const gridDays = Array.from({ length: 90 }, (_, i) => {
    if (!startDate) return { day: i + 1, checked: false, future: true };
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      day: i + 1,
      checked: checkins.includes(dateStr),
      future: d > new Date(),
    };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/metas")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Modo Disciplina</h1>
              <p className="text-xs text-primary-foreground/70">90 dias de foco total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {!isActive ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border text-center">
            <Flame className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Desafio 90 Dias</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Faça check-in diário e mantenha o foco na sua meta. A cada dia, você está mais perto da sua casa!
            </p>
            <Button onClick={handleStart} className="gradient-primary text-primary-foreground hover:opacity-90 rounded-xl h-12 w-full font-bold">
              Começar o Desafio 🔥
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
                <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Dia</p>
                <p className="text-xl font-bold text-foreground">{Math.min(dayNumber, 90)}</p>
                <p className="text-[10px] text-muted-foreground">de 90</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Streak</p>
                <p className="text-xl font-bold text-primary">{streak}</p>
                <p className="text-[10px] text-muted-foreground">check-ins</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
                <Check className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Progresso</p>
                <p className="text-xl font-bold text-foreground">{Math.round((streak / 90) * 100)}%</p>
                <p className="text-[10px] text-muted-foreground">completo</p>
              </div>
            </motion.div>

            {/* Check-in button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-lg border border-border text-center">
              {todayChecked ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">Check-in feito hoje! ✅</p>
                  <p className="text-xs text-muted-foreground mt-1">Continue amanhã</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Você guardou dinheiro hoje?</p>
                  <Button onClick={handleCheckin}
                    className="gradient-primary text-primary-foreground hover:opacity-90 rounded-xl h-12 w-full font-bold animate-pulse-glow">
                    Fazer Check-in 🔥
                  </Button>
                </div>
              )}
            </motion.div>

            {/* 90-day grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-5 shadow-lg border border-border">
              <h3 className="font-bold text-foreground text-sm mb-3">Mapa dos 90 dias</h3>
              <div className="grid grid-cols-15 gap-1">
                {gridDays.map(({ day, checked, future }) => (
                  <div
                    key={day}
                    className={`w-full aspect-square rounded-sm text-[6px] flex items-center justify-center font-medium ${
                      checked
                        ? "bg-primary text-primary-foreground"
                        : future
                        ? "bg-muted text-muted-foreground/30"
                        : "bg-destructive/20 text-destructive/50"
                    }`}
                    title={`Dia ${day}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
