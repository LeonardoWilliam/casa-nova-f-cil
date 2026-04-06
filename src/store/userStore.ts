// User Store - manages user plan and score
export type UserPlan = "free" | "premium";

export interface UserState {
  plano: UserPlan;
  score: number;
}

const USER_KEY = "granacasa_user";

const DEFAULT_USER: UserState = {
  plano: "free",
  score: 0,
};

export function getUserState(): UserState {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return { ...DEFAULT_USER };
  return { ...DEFAULT_USER, ...JSON.parse(stored) };
}

export function saveUserState(state: UserState) {
  localStorage.setItem(USER_KEY, JSON.stringify(state));
}

export function isPremium(): boolean {
  return getUserState().plano === "premium";
}

export function upgradeToPremium() {
  const state = getUserState();
  state.plano = "premium";
  saveUserState(state);
}

// === SCORE SYSTEM ===
// score = economia + consistência + controle de gastos

export interface ScoreBreakdown {
  economia: number;       // 0-40 pts: % da renda economizada
  consistencia: number;   // 0-30 pts: frequência de check-ins
  controleGastos: number; // 0-30 pts: gastos dentro do orçamento
  total: number;          // 0-100
}

export function calculateScore(
  economiaMensal: number,
  rendaMensal: number,
  checkinsCount: number,
  totalDias: number,
  gastosMes: number
): ScoreBreakdown {
  // Economia: % da renda economizada (max 40pts)
  const pctEconomia = rendaMensal > 0 ? (economiaMensal / rendaMensal) * 100 : 0;
  const economia = Math.min(40, Math.max(0, Math.round(pctEconomia * 2)));

  // Consistência: % de check-ins feitos (max 30pts)
  const pctCheckin = totalDias > 0 ? (checkinsCount / totalDias) * 100 : 0;
  const consistencia = Math.min(30, Math.max(0, Math.round(pctCheckin * 0.3)));

  // Controle de gastos: quanto menor o gasto vs renda, melhor (max 30pts)
  const pctGastos = rendaMensal > 0 ? (gastosMes / rendaMensal) * 100 : 100;
  const controleGastos = Math.min(30, Math.max(0, Math.round((100 - pctGastos) * 0.3)));

  const total = economia + consistencia + controleGastos;

  return { economia, consistencia, controleGastos, total };
}

export function getScoreLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 80) return { label: "Excelente", emoji: "🏆", color: "text-success" };
  if (score >= 60) return { label: "Bom", emoji: "👍", color: "text-primary" };
  if (score >= 40) return { label: "Regular", emoji: "📊", color: "text-warning" };
  return { label: "Precisa melhorar", emoji: "⚠️", color: "text-danger" };
}
