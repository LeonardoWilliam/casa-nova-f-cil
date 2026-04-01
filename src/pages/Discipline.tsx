import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  getProfile, saveProfile, FinancialProfile,
  getCurrentLevel, getNextLevel, getLevelProgress, GAME_LEVELS,
  ALL_BADGES, getEarnedBadges, earnBadge, addXp,
  getDailyChallenges, DailyChallenge,
} from "@/lib/financial-store";
import { ArrowLeft, Flame, Check, Calendar, Trophy, Star, Zap, Lock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";

export default function Discipline() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState<string | null>(null);

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

  const xp = profile.xp || 0;
  const level = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const earnedBadges = getEarnedBadges(profile);
  const challenges = getDailyChallenges(profile);

  const completedChallenges: string[] = JSON.parse(localStorage.getItem("granacasa_challenges_" + today) || "[]");

  const save = (p: FinancialProfile) => {
    saveProfile(p);
    setProfile(p);
  };

  const handleStart = () => {
    let updated = { ...profile, disciplinaAtiva: true, disciplinaDiaInicio: today, disciplinaCheckins: [] };
    updated = earnBadge(updated, "plano_criado");
    save(updated);
  };

  const handleCheckin = () => {
    if (todayChecked) return;
    let updated = { ...profile, disciplinaCheckins: [...checkins, today] };
    updated = addXp(updated, 25);
    // Badge checks
    if (checkins.length === 0) updated = earnBadge(updated, "first_checkin");
    if (checkins.length + 1 >= 7) updated = earnBadge(updated, "streak_7");
    if (checkins.length + 1 >= 30) updated = earnBadge(updated, "streak_30");
    if (checkins.length + 1 >= 90) updated = earnBadge(updated, "streak_90");
    save(updated);
  };

  const handleCompleteChallenge = (challenge: DailyChallenge) => {
    if (completedChallenges.includes(challenge.id)) return;
    const newCompleted = [...completedChallenges, challenge.id];
    localStorage.setItem("granacasa_challenges_" + today, JSON.stringify(newCompleted));
    const updated = addXp(profile, challenge.xpReward);
    save(updated);
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
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary-foreground">Modo Disciplina</h1>
              <p className="text-xs text-primary-foreground/70">90 dias de foco total</p>
            </div>
            {/* XP Badge */}
            <div className="bg-primary-foreground/20 rounded-full px-3 py-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="text-xs font-bold text-primary-foreground">{xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Level Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: level.color + "20" }}>
              {level.emoji}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Nível {level.id}</p>
              <p className="font-bold text-foreground">{level.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Próximo</p>
              <p className="text-sm font-semibold">{nextLevel ? nextLevel.emoji : "👑"}</p>
            </div>
          </div>
          <Progress value={levelProgress} className="h-2.5" />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {nextLevel ? `${nextLevel.minXp - xp} XP para "${nextLevel.name}"` : "Nível máximo alcançado! 🎉"}
          </p>
        </motion.div>

        {/* Level Roadmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Jornada de Níveis</h3>
          </div>
          <div className="space-y-2">
            {GAME_LEVELS.map((gl) => {
              const unlocked = xp >= gl.minXp;
              const isCurrent = gl.id === level.id;
              return (
                <div key={gl.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    isCurrent ? "bg-primary/10 border border-primary/20" : unlocked ? "opacity-80" : "opacity-40"
                  }`}>
                  <span className="text-lg">{unlocked ? gl.emoji : "🔒"}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>{gl.name}</p>
                    <p className="text-[10px] text-muted-foreground">{gl.minXp} XP</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">ATUAL</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {!isActive ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border text-center">
            <Flame className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Desafio 90 Dias</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Faça check-in diário, complete desafios e suba de nível. A cada dia, mais perto da sua casa!
            </p>
            <Button onClick={handleStart} className="gradient-primary text-primary-foreground hover:opacity-90 rounded-xl h-12 w-full font-bold">
              Começar o Desafio 🔥
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
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
                <Star className="w-5 h-5 mx-auto mb-1" style={{ color: level.color }} />
                <p className="text-[10px] text-muted-foreground">Nível</p>
                <p className="text-xl font-bold text-foreground">{level.id}</p>
                <p className="text-[10px] text-muted-foreground truncate">{level.emoji}</p>
              </div>
            </motion.div>

            {/* Check-in button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl p-5 shadow-lg border border-border text-center">
              {todayChecked ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">Check-in feito hoje! ✅</p>
                  <p className="text-xs text-muted-foreground mt-1">+25 XP ganhos! Continue amanhã</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Você guardou dinheiro hoje?</p>
                  <Button onClick={handleCheckin}
                    className="gradient-primary text-primary-foreground hover:opacity-90 rounded-xl h-12 w-full font-bold">
                    Fazer Check-in (+25 XP) 🔥
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Daily Challenges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-5 shadow-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-secondary" />
                <h3 className="font-bold text-foreground text-sm">Desafios do dia</h3>
              </div>
              <div className="space-y-3">
                {challenges.map((c) => {
                  const done = completedChallenges.includes(c.id);
                  return (
                    <div key={c.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        done ? "bg-primary/5 border-primary/20" : "border-border"
                      }`}>
                      <span className="text-xl">{c.emoji}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${done ? "text-primary line-through" : "text-foreground"}`}>{c.title}</p>
                        <p className="text-[10px] text-muted-foreground">{c.description}</p>
                      </div>
                      {done ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <Button size="sm" onClick={() => handleCompleteChallenge(c)}
                          className="text-xs h-7 rounded-lg gradient-primary text-primary-foreground">
                          +{c.xpReward} XP
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* 90-day grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
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

        {/* Badges Collection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Conquistas</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">{earnedBadges.length}/{ALL_BADGES.length}</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = (profile.badges || []).includes(badge.id);
              return (
                <button key={badge.id}
                  onClick={() => earned && setShowBadgeModal(badge.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    earned ? "bg-primary/5" : "opacity-30"
                  }`}>
                  <span className="text-2xl">{earned ? badge.emoji : "🔒"}</span>
                  <span className="text-[8px] text-muted-foreground text-center leading-tight">{badge.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Badge Modal */}
        <AnimatePresence>
          {showBadgeModal && (() => {
            const badge = ALL_BADGES.find(b => b.id === showBadgeModal);
            if (!badge) return null;
            return (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
                onClick={() => setShowBadgeModal(null)}>
                <motion.div
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                  className="bg-card rounded-2xl p-6 shadow-2xl text-center max-w-xs w-full"
                  onClick={e => e.stopPropagation()}>
                  <span className="text-5xl block mb-3">{badge.emoji}</span>
                  <h3 className="text-lg font-bold text-foreground mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>
                  <p className="text-xs text-primary font-semibold">+100 XP</p>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
