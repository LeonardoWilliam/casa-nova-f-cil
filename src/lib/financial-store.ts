export interface FinancialProfile {
  nome: string;
  rendaMensal: number;
  gastosFixos: {
    aluguel: number;
    luz: number;
    internet: number;
    transporte: number;
    alimentacao: number;
    outros: number;
  };
  gastosVariaveis: number;
  temDividas: boolean;
  dividas: number;
  valorImovel: number;
  prazoAnos: number;
  metaMensalEconomia: number;
  totalEconomizado: number;
  onboardingCompleto: boolean;
  // Discipline mode
  disciplinaAtiva: boolean;
  disciplinaDiaInicio: string;
  disciplinaCheckins: string[]; // dates
  // Gamification
  xp: number;
  badges: string[]; // badge IDs earned
}

// === GAMIFICATION SYSTEM ===

export interface GameLevel {
  id: number;
  name: string;
  emoji: string;
  minXp: number;
  color: string;
}

export const GAME_LEVELS: GameLevel[] = [
  { id: 1, name: "Saindo do aperto", emoji: "🌱", minXp: 0, color: "hsl(0, 84%, 60%)" },
  { id: 2, name: "Organizando a vida", emoji: "📋", minXp: 200, color: "hsl(38, 92%, 50%)" },
  { id: 3, name: "Poupador iniciante", emoji: "🐣", minXp: 500, color: "hsl(38, 92%, 50%)" },
  { id: 4, name: "No caminho certo", emoji: "🚶", minXp: 1000, color: "hsl(142, 71%, 45%)" },
  { id: 5, name: "Disciplinado", emoji: "💪", minXp: 2000, color: "hsl(142, 71%, 35%)" },
  { id: 6, name: "Quase lá", emoji: "🏃", minXp: 3500, color: "hsl(217, 91%, 60%)" },
  { id: 7, name: "Pronto pra comprar", emoji: "🏠", minXp: 5000, color: "hsl(280, 50%, 55%)" },
  { id: 8, name: "Mestre financeiro", emoji: "👑", minXp: 8000, color: "hsl(45, 93%, 47%)" },
];

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ALL_BADGES: Badge[] = [
  { id: "first_checkin", name: "Primeiro passo", emoji: "🥇", description: "Fez seu primeiro check-in" },
  { id: "streak_7", name: "1 semana firme", emoji: "🔥", description: "7 check-ins no modo disciplina" },
  { id: "streak_30", name: "1 mês de foco", emoji: "⚡", description: "30 check-ins no modo disciplina" },
  { id: "streak_90", name: "Guerreiro 90 dias", emoji: "🏆", description: "Completou os 90 dias" },
  { id: "plano_criado", name: "Plano criado", emoji: "📝", description: "Criou seu plano financeiro" },
  { id: "sem_dividas", name: "Livre de dívidas", emoji: "🎉", description: "Declarou não ter dívidas" },
  { id: "saude_verde", name: "Saúde verde", emoji: "💚", description: "Alcançou saúde financeira verde" },
  { id: "simulador_usado", name: "Explorador", emoji: "🔮", description: "Usou o simulador financeiro" },
  { id: "meta_50", name: "Meio caminho", emoji: "🌟", description: "Alcançou 50% da meta de entrada" },
  { id: "economizou_1000", name: "Primeiro mil", emoji: "💰", description: "Economizou R$1.000" },
];

export function getCurrentLevel(xp: number): GameLevel {
  let level = GAME_LEVELS[0];
  for (const l of GAME_LEVELS) {
    if (xp >= l.minXp) level = l;
  }
  return level;
}

export function getNextLevel(xp: number): GameLevel | null {
  for (const l of GAME_LEVELS) {
    if (xp < l.minXp) return l;
  }
  return null;
}

export function getLevelProgress(xp: number): number {
  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  const progress = xp - current.minXp;
  return Math.round((progress / range) * 100);
}

export function addXp(profile: FinancialProfile, amount: number): FinancialProfile {
  return { ...profile, xp: (profile.xp || 0) + amount };
}

export function earnBadge(profile: FinancialProfile, badgeId: string): FinancialProfile {
  const badges = profile.badges || [];
  if (badges.includes(badgeId)) return profile;
  return { ...profile, badges: [...badges, badgeId], xp: (profile.xp || 0) + 100 };
}

export function getEarnedBadges(profile: FinancialProfile): Badge[] {
  const ids = profile.badges || [];
  return ALL_BADGES.filter(b => ids.includes(b.id));
}

// Daily challenges
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  emoji: string;
}

export function getDailyChallenges(profile: FinancialProfile): DailyChallenge[] {
  const day = new Date().getDay();
  const challenges: DailyChallenge[] = [
    { id: "no_spend", title: "Dia sem gastos extras", description: "Não gaste com nada supérfluo hoje", xpReward: 30, emoji: "🚫" },
    { id: "save_10", title: "Guarde R$10", description: "Separe pelo menos R$10 hoje", xpReward: 20, emoji: "💰" },
    { id: "review_budget", title: "Revise seu orçamento", description: "Olhe seus gastos e veja onde cortar", xpReward: 15, emoji: "📊" },
    { id: "cook_home", title: "Cozinhe em casa", description: "Evite delivery e cozinhe hoje", xpReward: 25, emoji: "🍳" },
    { id: "walk", title: "Vá a pé", description: "Economize com transporte hoje", xpReward: 20, emoji: "🚶" },
    { id: "cancel_sub", title: "Cancele algo", description: "Cancele uma assinatura que não usa", xpReward: 50, emoji: "✂️" },
    { id: "learn", title: "Aprenda sobre finanças", description: "Leia um artigo sobre investimento", xpReward: 15, emoji: "📚" },
  ];
  // Rotate based on day
  return [challenges[day % challenges.length], challenges[(day + 3) % challenges.length]];
}

const DEFAULT_PROFILE: FinancialProfile = {
  nome: "",
  rendaMensal: 0,
  gastosFixos: {
    aluguel: 0,
    luz: 0,
    internet: 0,
    transporte: 0,
    alimentacao: 0,
    outros: 0,
  },
  gastosVariaveis: 0,
  temDividas: false,
  dividas: 0,
  valorImovel: 250000,
  prazoAnos: 5,
  metaMensalEconomia: 0,
  totalEconomizado: 0,
  onboardingCompleto: false,
  disciplinaAtiva: false,
  disciplinaDiaInicio: "",
  disciplinaCheckins: [],
};

const STORAGE_KEY = "granacasa_profile";

export function getProfile(): FinancialProfile {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { ...DEFAULT_PROFILE };
  return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
}

export function saveProfile(profile: FinancialProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTotalGastosFixos(p: FinancialProfile): number {
  return Object.values(p.gastosFixos).reduce((a, b) => a + b, 0);
}

export function getSaldo(p: FinancialProfile): number {
  return p.rendaMensal - getTotalGastosFixos(p) - p.gastosVariaveis;
}

export function getEntradaImovel(p: FinancialProfile): number {
  return p.valorImovel * 0.2;
}

export function getMesesParaEntrada(p: FinancialProfile): number {
  const economia = p.metaMensalEconomia || getSaldo(p) * 0.5;
  if (economia <= 0) return Infinity;
  return Math.ceil(getEntradaImovel(p) / economia);
}

export function getSaudeFinanceira(p: FinancialProfile): "verde" | "amarelo" | "vermelho" {
  const saldo = getSaldo(p);
  const percentualSaldo = (saldo / p.rendaMensal) * 100;
  if (percentualSaldo >= 20) return "verde";
  if (percentualSaldo >= 10) return "amarelo";
  return "vermelho";
}

export function getValorImovelSugerido(renda: number): number {
  return Math.round((renda * 60) / 10000) * 10000;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatTempoRestante(meses: number): string {
  if (meses === Infinity) return "—";
  const anos = Math.floor(meses / 12);
  const m = meses % 12;
  if (anos === 0) return `${m} meses`;
  if (m === 0) return `${anos} ano${anos > 1 ? "s" : ""}`;
  return `${anos} ano${anos > 1 ? "s" : ""} e ${m} mes${m > 1 ? "es" : ""}`;
}

// Expenses mock data
export interface Expense {
  id: string;
  name: string;
  category: string;
  value: number;
  icon: string;
}

export function getExpenses(p: FinancialProfile): Expense[] {
  const expenses: Expense[] = [];
  if (p.gastosFixos.aluguel > 0)
    expenses.push({ id: "1", name: "Aluguel", category: "Moradia", value: p.gastosFixos.aluguel, icon: "🏠" });
  if (p.gastosFixos.luz > 0)
    expenses.push({ id: "2", name: "Conta de Luz", category: "Moradia", value: p.gastosFixos.luz, icon: "💡" });
  if (p.gastosFixos.internet > 0)
    expenses.push({ id: "3", name: "Internet", category: "Moradia", value: p.gastosFixos.internet, icon: "📶" });
  if (p.gastosFixos.transporte > 0)
    expenses.push({ id: "4", name: "Transporte", category: "Transporte", value: p.gastosFixos.transporte, icon: "🚌" });
  if (p.gastosFixos.alimentacao > 0)
    expenses.push({ id: "5", name: "Alimentação", category: "Alimentação", value: p.gastosFixos.alimentacao, icon: "🛒" });
  if (p.gastosFixos.outros > 0)
    expenses.push({ id: "6", name: "Outros fixos", category: "Outros", value: p.gastosFixos.outros, icon: "📦" });
  if (p.gastosVariaveis > 0)
    expenses.push({ id: "7", name: "Gastos variáveis", category: "Lazer", value: p.gastosVariaveis, icon: "🎮" });
  return expenses;
}

// Alerts
export interface Alert {
  id: string;
  type: "warning" | "tip" | "reminder";
  icon: string;
  message: string;
}

export function getAlerts(p: FinancialProfile): Alert[] {
  const alerts: Alert[] = [];
  const saldo = getSaldo(p);
  const totalGastos = getTotalGastosFixos(p) + p.gastosVariaveis;

  if (totalGastos > p.rendaMensal * 0.85) {
    alerts.push({
      id: "1",
      type: "warning",
      icon: "⚠️",
      message: "Você gastou mais do que o planejado este mês. Cuidado!",
    });
  }
  if (saldo > 0) {
    alerts.push({
      id: "2",
      type: "tip",
      icon: "💡",
      message: "Hoje é um bom dia pra guardar dinheiro! Separe pelo menos " + formatCurrency(saldo * 0.1),
    });
  }
  if (p.gastosFixos.luz > 0) {
    alerts.push({
      id: "3",
      type: "reminder",
      icon: "📅",
      message: "Conta de luz vence em breve. Valor: " + formatCurrency(p.gastosFixos.luz),
    });
  }
  if (p.temDividas && p.dividas > 0) {
    alerts.push({
      id: "4",
      type: "warning",
      icon: "🔴",
      message: `Você tem ${formatCurrency(p.dividas)} em dívidas. Priorize quitar antes de investir.`,
    });
  }
  if (p.gastosVariaveis > p.rendaMensal * 0.15) {
    alerts.push({
      id: "5",
      type: "tip",
      icon: "✂️",
      message: `Seus gastos variáveis representam ${Math.round((p.gastosVariaveis / p.rendaMensal) * 100)}% da renda. Tente reduzir para 15%.`,
    });
  }
  return alerts;
}
