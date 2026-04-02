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
  disciplinaAtiva: boolean;
  disciplinaDiaInicio: string;
  disciplinaCheckins: string[];
  xp: number;
  badges: string[];
}

// === TRANSACTIONS ===

export type TransactionType = "entrada" | "saida";

export type TransactionCategory =
  | "salario" | "freelance" | "investimento" | "presente" | "outros_entrada"
  | "moradia" | "alimentacao" | "transporte" | "lazer" | "saude" | "educacao" | "streaming" | "delivery" | "compras" | "outros_saida";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  value: number;
  date: string; // ISO
  createdAt: string;
}

export const CATEGORIES: Record<TransactionCategory, { label: string; emoji: string; type: TransactionType }> = {
  salario: { label: "Salário", emoji: "💵", type: "entrada" },
  freelance: { label: "Freelance", emoji: "💻", type: "entrada" },
  investimento: { label: "Investimento", emoji: "📈", type: "entrada" },
  presente: { label: "Presente", emoji: "🎁", type: "entrada" },
  outros_entrada: { label: "Outros", emoji: "💰", type: "entrada" },
  moradia: { label: "Moradia", emoji: "🏠", type: "saida" },
  alimentacao: { label: "Alimentação", emoji: "🛒", type: "saida" },
  transporte: { label: "Transporte", emoji: "🚌", type: "saida" },
  lazer: { label: "Lazer", emoji: "🎮", type: "saida" },
  saude: { label: "Saúde", emoji: "🏥", type: "saida" },
  educacao: { label: "Educação", emoji: "📚", type: "saida" },
  streaming: { label: "Streaming", emoji: "📺", type: "saida" },
  delivery: { label: "Delivery", emoji: "🍔", type: "saida" },
  compras: { label: "Compras", emoji: "🛍️", type: "saida" },
  outros_saida: { label: "Outros", emoji: "📦", type: "saida" },
};

const TX_KEY = "granacasa_transactions";
const UNDO_KEY = "granacasa_undo";
const REDO_KEY = "granacasa_redo";
const ACTIVITY_KEY = "granacasa_activity";

export function getTransactions(): Transaction[] {
  const stored = localStorage.getItem(TX_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTransactions(txs: Transaction[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

export function addTransaction(tx: Omit<Transaction, "id" | "createdAt">): Transaction {
  const txs = getTransactions();
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const updated = [newTx, ...txs];
  saveTransactions(updated);
  // Push to undo stack
  pushUndo({ action: "add", transaction: newTx });
  clearRedo();
  // Log activity
  const cat = CATEGORIES[tx.category];
  logActivity(
    tx.type === "entrada"
      ? `Receita adicionada: ${cat.emoji} ${tx.description} — ${formatCurrency(tx.value)}`
      : `Despesa registrada: ${cat.emoji} ${tx.description} — ${formatCurrency(tx.value)}`
  );
  // Auto-update savings if income
  if (tx.type === "entrada") {
    const p = getProfile();
    p.totalEconomizado += tx.value * 0.2; // 20% of income goes to savings
    saveProfile(p);
  }
  return newTx;
}

export function deleteTransaction(id: string) {
  const txs = getTransactions();
  const tx = txs.find(t => t.id === id);
  if (!tx) return;
  saveTransactions(txs.filter(t => t.id !== id));
  pushUndo({ action: "delete", transaction: tx });
  clearRedo();
  logActivity(`Transação removida: ${tx.description}`);
}

// === UNDO / REDO ===

interface UndoAction {
  action: "add" | "delete";
  transaction: Transaction;
}

function getUndoStack(): UndoAction[] {
  const s = localStorage.getItem(UNDO_KEY);
  return s ? JSON.parse(s) : [];
}

function getRedoStack(): UndoAction[] {
  const s = localStorage.getItem(REDO_KEY);
  return s ? JSON.parse(s) : [];
}

function pushUndo(a: UndoAction) {
  const stack = getUndoStack();
  stack.push(a);
  if (stack.length > 50) stack.shift();
  localStorage.setItem(UNDO_KEY, JSON.stringify(stack));
}

function clearRedo() {
  localStorage.setItem(REDO_KEY, JSON.stringify([]));
}

export function canUndo(): boolean {
  return getUndoStack().length > 0;
}

export function canRedo(): boolean {
  return getRedoStack().length > 0;
}

export function undo(): string | null {
  const undoStack = getUndoStack();
  const action = undoStack.pop();
  if (!action) return null;
  localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack));

  const txs = getTransactions();
  const redoStack = getRedoStack();

  if (action.action === "add") {
    // Undo an add = remove it
    saveTransactions(txs.filter(t => t.id !== action.transaction.id));
    redoStack.push({ action: "add", transaction: action.transaction });
  } else {
    // Undo a delete = re-add it
    saveTransactions([action.transaction, ...txs]);
    redoStack.push({ action: "delete", transaction: action.transaction });
  }
  localStorage.setItem(REDO_KEY, JSON.stringify(redoStack));
  logActivity("Ação desfeita");
  return action.transaction.description;
}

export function redo(): string | null {
  const redoStack = getRedoStack();
  const action = redoStack.pop();
  if (!action) return null;
  localStorage.setItem(REDO_KEY, JSON.stringify(redoStack));

  const txs = getTransactions();
  const undoStack = getUndoStack();

  if (action.action === "add") {
    saveTransactions([action.transaction, ...txs]);
    undoStack.push({ action: "add", transaction: action.transaction });
  } else {
    saveTransactions(txs.filter(t => t.id !== action.transaction.id));
    undoStack.push({ action: "delete", transaction: action.transaction });
  }
  localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack));
  logActivity("Ação refeita");
  return action.transaction.description;
}

// === ACTIVITY LOG ===

export interface ActivityEntry {
  id: string;
  message: string;
  timestamp: string;
}

export function logActivity(message: string) {
  const log = getActivityLog();
  log.unshift({ id: crypto.randomUUID(), message, timestamp: new Date().toISOString() });
  if (log.length > 100) log.pop();
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log));
}

export function getActivityLog(): ActivityEntry[] {
  const s = localStorage.getItem(ACTIVITY_KEY);
  return s ? JSON.parse(s) : [];
}

// === SMART ALERTS ===

export function getSmartAlerts(profile: FinancialProfile): Alert[] {
  const alerts: Alert[] = [];
  const txs = getTransactions();
  const now = new Date();
  const thisMonth = txs.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthExpenses = thisMonth.filter(t => t.type === "saida").reduce((s, t) => s + t.value, 0);
  const monthIncome = thisMonth.filter(t => t.type === "entrada").reduce((s, t) => s + t.value, 0);
  const totalBudget = profile.rendaMensal;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBudget = totalBudget / daysInMonth;
  const expectedSpend = dailyBudget * dayOfMonth;

  if (monthExpenses > expectedSpend * 1.2) {
    alerts.push({ id: "pace", type: "warning", icon: "🔥", message: `Seus gastos estão ${Math.round(((monthExpenses / expectedSpend) - 1) * 100)}% acima do ritmo ideal para este mês` });
  }

  // Category analysis
  const catTotals: Record<string, number> = {};
  thisMonth.filter(t => t.type === "saida").forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.value;
  });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCat && topCat[1] > totalBudget * 0.25) {
    const cat = CATEGORIES[topCat[0] as TransactionCategory];
    alerts.push({ id: "topcat", type: "tip", icon: "📊", message: `${cat.emoji} ${cat.label} representa ${Math.round((topCat[1] / totalBudget) * 100)}% da sua renda. Tente reduzir!` });
  }

  // Delivery pattern
  const deliveryTotal = catTotals["delivery"] || 0;
  if (deliveryTotal > 200) {
    alerts.push({ id: "delivery", type: "tip", icon: "🍔", message: `Você já gastou ${formatCurrency(deliveryTotal)} com delivery este mês. Cozinhar pode economizar até 60%!` });
  }

  // Savings projection
  const saldo = getSaldo(profile);
  if (saldo > 0 && monthIncome > 0) {
    const potentialSaving = saldo * 0.5;
    alerts.push({ id: "saving", type: "tip", icon: "💡", message: `Se guardar ${formatCurrency(potentialSaving)}/mês, você terá ${formatCurrency(potentialSaving * 12)} em 1 ano!` });
  }

  // Spending limit
  const percentUsed = (monthExpenses / totalBudget) * 100;
  if (percentUsed >= 80 && percentUsed < 100) {
    alerts.push({ id: "limit80", type: "warning", icon: "⚠️", message: `Atenção! Você já usou ${Math.round(percentUsed)}% do seu orçamento mensal` });
  } else if (percentUsed >= 100) {
    alerts.push({ id: "limit100", type: "warning", icon: "🚨", message: `Orçamento estourado! Gastos ${Math.round(percentUsed)}% da renda` });
  }

  // Bill reminder
  if (dayOfMonth >= 25 || dayOfMonth <= 5) {
    alerts.push({ id: "bills", type: "reminder", icon: "📅", message: "Período de vencimento de contas. Verifique seus pagamentos!" });
  }

  // No transactions warning
  if (thisMonth.length === 0 && dayOfMonth > 5) {
    alerts.push({ id: "notx", type: "reminder", icon: "📝", message: "Você ainda não registrou transações este mês. Registre para ter um controle melhor!" });
  }

  return alerts;
}

// === MONTHLY PROJECTION ===

export interface MonthlyProjection {
  month: string;
  economizado: number;
  acumulado: number;
  meta: number;
}

export function getMonthlyProjections(profile: FinancialProfile, months: number = 12): MonthlyProjection[] {
  const saldo = getSaldo(profile);
  const economia = Math.max(saldo * 0.5, profile.metaMensalEconomia || 0);
  const entrada = getEntradaImovel(profile);
  const projections: MonthlyProjection[] = [];
  let acumulado = profile.totalEconomizado;

  const now = new Date();
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    acumulado += economia;
    projections.push({
      month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      economizado: economia,
      acumulado: Math.round(acumulado),
      meta: entrada,
    });
  }
  return projections;
}

// === FINANCIAL TIMELINE ===

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  emoji: string;
  type: "milestone" | "transaction" | "achievement";
}

export function getFinancialTimeline(profile: FinancialProfile): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const txs = getTransactions().slice(0, 20);

  txs.forEach(tx => {
    const cat = CATEGORIES[tx.category];
    events.push({
      id: tx.id,
      date: tx.date,
      title: tx.description,
      description: `${tx.type === "entrada" ? "+" : "-"}${formatCurrency(tx.value)} • ${cat.label}`,
      emoji: cat.emoji,
      type: "transaction",
    });
  });

  // Milestones
  const entrada = getEntradaImovel(profile);
  const pct = (profile.totalEconomizado / entrada) * 100;
  if (pct >= 10) events.push({ id: "m10", date: new Date().toISOString(), title: "10% da entrada", description: "Você já juntou 10% da entrada!", emoji: "🎯", type: "milestone" });
  if (pct >= 25) events.push({ id: "m25", date: new Date().toISOString(), title: "25% da entrada", description: "Um quarto do caminho!", emoji: "⭐", type: "milestone" });
  if (pct >= 50) events.push({ id: "m50", date: new Date().toISOString(), title: "Metade da entrada!", description: "Você está na metade!", emoji: "🌟", type: "milestone" });

  // Badges earned
  (profile.badges || []).forEach(bid => {
    const badge = ALL_BADGES.find(b => b.id === bid);
    if (badge) {
      events.push({ id: `badge_${bid}`, date: new Date().toISOString(), title: badge.name, description: badge.description, emoji: badge.emoji, type: "achievement" });
    }
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// === TRANSACTION STATS ===

export function getTransactionStats() {
  const txs = getTransactions();
  const now = new Date();
  const thisMonth = txs.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalEntradas = thisMonth.filter(t => t.type === "entrada").reduce((s, t) => s + t.value, 0);
  const totalSaidas = thisMonth.filter(t => t.type === "saida").reduce((s, t) => s + t.value, 0);
  const saldoMes = totalEntradas - totalSaidas;

  return { totalEntradas, totalSaidas, saldoMes, count: thisMonth.length };
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
  { id: "first_tx", name: "Primeira transação", emoji: "📊", description: "Registrou sua primeira transação" },
  { id: "tx_10", name: "Registrador", emoji: "✍️", description: "Registrou 10 transações" },
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
  return [challenges[day % challenges.length], challenges[(day + 3) % challenges.length]];
}

const DEFAULT_PROFILE: FinancialProfile = {
  nome: "",
  rendaMensal: 0,
  gastosFixos: { aluguel: 0, luz: 0, internet: 0, transporte: 0, alimentacao: 0, outros: 0 },
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
  xp: 0,
  badges: [],
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
  localStorage.removeItem(TX_KEY);
  localStorage.removeItem(UNDO_KEY);
  localStorage.removeItem(REDO_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
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

export interface Expense {
  id: string;
  name: string;
  category: string;
  value: number;
  icon: string;
}

export function getExpenses(p: FinancialProfile): Expense[] {
  const expenses: Expense[] = [];
  if (p.gastosFixos.aluguel > 0) expenses.push({ id: "1", name: "Aluguel", category: "Moradia", value: p.gastosFixos.aluguel, icon: "🏠" });
  if (p.gastosFixos.luz > 0) expenses.push({ id: "2", name: "Conta de Luz", category: "Moradia", value: p.gastosFixos.luz, icon: "💡" });
  if (p.gastosFixos.internet > 0) expenses.push({ id: "3", name: "Internet", category: "Moradia", value: p.gastosFixos.internet, icon: "📶" });
  if (p.gastosFixos.transporte > 0) expenses.push({ id: "4", name: "Transporte", category: "Transporte", value: p.gastosFixos.transporte, icon: "🚌" });
  if (p.gastosFixos.alimentacao > 0) expenses.push({ id: "5", name: "Alimentação", category: "Alimentação", value: p.gastosFixos.alimentacao, icon: "🛒" });
  if (p.gastosFixos.outros > 0) expenses.push({ id: "6", name: "Outros fixos", category: "Outros", value: p.gastosFixos.outros, icon: "📦" });
  if (p.gastosVariaveis > 0) expenses.push({ id: "7", name: "Gastos variáveis", category: "Lazer", value: p.gastosVariaveis, icon: "🎮" });
  return expenses;
}

export interface Alert {
  id: string;
  type: "warning" | "tip" | "reminder";
  icon: string;
  message: string;
}

export function getAlerts(p: FinancialProfile): Alert[] {
  // Use smart alerts now
  return getSmartAlerts(p);
}
