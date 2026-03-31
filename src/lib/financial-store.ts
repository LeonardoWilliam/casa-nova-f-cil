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
