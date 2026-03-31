// Simple localStorage-based store for financial data (no backend needed for v1)

export interface FinancialProfile {
  rendaMensal: number;
  gastosFixos: {
    aluguel: number;
    contas: number;
    transporte: number;
    alimentacao: number;
    outros: number;
  };
  gastosVariaveis: number;
  dividas: number;
  valorImovel: number;
  prazoAnos: number;
  metaMensalEconomia: number;
  onboardingCompleto: boolean;
}

const DEFAULT_PROFILE: FinancialProfile = {
  rendaMensal: 0,
  gastosFixos: {
    aluguel: 0,
    contas: 0,
    transporte: 0,
    alimentacao: 0,
    outros: 0,
  },
  gastosVariaveis: 0,
  dividas: 0,
  valorImovel: 250000,
  prazoAnos: 5,
  metaMensalEconomia: 0,
  onboardingCompleto: false,
};

export function getProfile(): FinancialProfile {
  const stored = localStorage.getItem("casameta_profile");
  if (!stored) return { ...DEFAULT_PROFILE };
  return JSON.parse(stored);
}

export function saveProfile(profile: FinancialProfile) {
  localStorage.setItem("casameta_profile", JSON.stringify(profile));
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
  // Regra: parcela max ~30% da renda, financiamento 30 anos, ~0.7% a.m.
  // Simplificação: imóvel ≈ renda × 60
  return Math.round(renda * 60 / 10000) * 10000;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
