import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  getProfile, FinancialProfile, formatCurrency, resetProfile,
  formatTempoRestante, getMesesParaEntrada,
  getCurrentLevel, getNextLevel, getLevelProgress, GAME_LEVELS,
  getEarnedBadges, ALL_BADGES,
} from "@/lib/financial-store";
import { ArrowLeft, User, DollarSign, Home, Clock, RotateCcw, Edit, Trophy, Zap, Star } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const meses = getMesesParaEntrada(profile);
  const xp = profile.xp || 0;
  const level = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const levelProg = getLevelProgress(xp);
  const earnedBadges = getEarnedBadges(profile);
  const streak = (profile.disciplinaCheckins || []).length;

  const handleReset = () => {
    if (window.confirm("Tem certeza? Isso irá apagar todos os seus dados.")) {
      resetProfile();
      navigate("/");
    }
  };

  const items = [
    { icon: DollarSign, label: "Renda mensal", value: formatCurrency(profile.rendaMensal) },
    { icon: Home, label: "Objetivo", value: `Imóvel de ${formatCurrency(profile.valorImovel)}` },
    { icon: Clock, label: "Prazo desejado", value: `${profile.prazoAnos} anos` },
    { icon: Clock, label: "Tempo estimado", value: formatTempoRestante(meses) },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-primary-foreground">Meu Perfil</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Avatar + Level */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-2 relative">
            <span className="text-3xl font-bold text-primary-foreground">
              {(profile.nome || "U").charAt(0).toUpperCase()}
            </span>
            <span className="absolute -bottom-1 -right-1 text-xl">{level.emoji}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile.nome || "Usuário"}</h2>
          <p className="text-sm font-semibold mt-1" style={{ color: level.color }}>{level.name}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground">{xp} XP</span>
          </div>
          <div className="mt-3 px-8">
            <Progress value={levelProg} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {nextLevel ? `${nextLevel.minXp - xp} XP para "${nextLevel.name}"` : "Nível máximo! 👑"}
            </p>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 shadow-md border border-border text-center">
            <Star className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{level.id}</p>
            <p className="text-[9px] text-muted-foreground">Nível</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-md border border-border text-center">
            <Trophy className="w-4 h-4 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{earnedBadges.length}</p>
            <p className="text-[9px] text-muted-foreground">Conquistas</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-md border border-border text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{streak}</p>
            <p className="text-[9px] text-muted-foreground">Check-ins</p>
          </div>
        </motion.div>

        {/* Badges showcase */}
        {earnedBadges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 shadow-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-sm">Conquistas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <div key={b.id} className="bg-primary/5 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{b.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Info items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl shadow-lg border border-border divide-y divide-border">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4">
              <Icon className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-3">
          <Button
            onClick={() => {
              resetProfile();
              navigate("/onboarding");
            }}
            variant="outline"
            className="w-full rounded-xl h-12"
          >
            <Edit className="w-4 h-4 mr-2" /> Editar dados
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full rounded-xl h-12 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Resetar plano
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
