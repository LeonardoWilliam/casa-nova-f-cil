import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile,
  FinancialProfile,
  getTotalGastosFixos,
  getSaldo,
  getEntradaImovel,
  getMesesParaEntrada,
  getSaudeFinanceira,
  formatCurrency,
  formatTempoRestante,
} from "@/lib/financial-store";
import {
  TrendingUp,
  PiggyBank,
  Lightbulb,
  ChevronRight,
  Calculator,
  DollarSign,
  CreditCard,
  Wallet,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BottomNav } from "@/components/BottomNav";

const HEALTH_MAP = {
  verde: { label: "Saudável", color: "text-success", bg: "bg-primary/10", emoji: "🟢" },
  amarelo: { label: "Atenção", color: "text-warning", bg: "bg-warning/10", emoji: "🟡" },
  vermelho: { label: "Crítico", color: "text-danger", bg: "bg-destructive/10", emoji: "🔴" },
};

const PIE_COLORS = [
  "hsl(142, 71%, 35%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 50%, 55%)",
  "hsl(0, 84%, 60%)",
  "hsl(180, 50%, 45%)",
  "hsl(320, 60%, 50%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) {
      navigate("/");
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const totalFixos = getTotalGastosFixos(profile);
  const totalGastos = totalFixos + profile.gastosVariaveis;
  const saldo = getSaldo(profile);
  const entrada = getEntradaImovel(profile);
  const meses = getMesesParaEntrada(profile);
  const saude = getSaudeFinanceira(profile);
  const healthInfo = HEALTH_MAP[saude];

  const progressPercent = Math.min(
    ((profile.totalEconomizado) / entrada) * 100,
    100
  );

  const chartData = [
    { name: "Aluguel", value: profile.gastosFixos.aluguel },
    { name: "Luz", value: profile.gastosFixos.luz },
    { name: "Internet", value: profile.gastosFixos.internet },
    { name: "Transporte", value: profile.gastosFixos.transporte },
    { name: "Alimentação", value: profile.gastosFixos.alimentacao },
    { name: "Variáveis", value: profile.gastosVariaveis },
    { name: "Outros", value: profile.gastosFixos.outros },
  ].filter((d) => d.value > 0);

  // Smart suggestion
  const sugestao = profile.gastosVariaveis > profile.rendaMensal * 0.1
    ? `Você pode economizar ${formatCurrency(profile.gastosVariaveis * 0.3)} reduzindo gastos com delivery e lazer`
    : saldo > 0
    ? `Economizando mais ${formatCurrency(saldo * 0.1)}/mês, você antecipa sua casa em ~${Math.max(1, Math.round(meses * 0.1))} meses`
    : "Tente reduzir alguns gastos fixos para começar a economizar";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-12 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-foreground/80 text-sm">Olá, {profile.nome || "Usuário"} 👋</p>
              <h1 className="text-xl font-bold text-primary-foreground">Meu painel</h1>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${healthInfo.bg} ${healthInfo.color} border border-border/20`}>
              {healthInfo.emoji} {healthInfo.label}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-4">
        {/* BLOCO 1: Meta principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Entrada da sua casa</h3>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{formatCurrency(profile.totalEconomizado)}</span>
            <span className="font-semibold text-foreground">{formatCurrency(entrada)}</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Faltam <span className="font-semibold text-foreground">{formatTempoRestante(meses)}</span>
          </p>
        </motion.div>

        {/* BLOCO 2: Resumo financeiro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Receita</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(profile.rendaMensal)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <CreditCard className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Gastos</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalGastos)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <Wallet className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Sobra</p>
            <p className={`text-sm font-bold ${saldo >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </motion.div>

        {/* BLOCO 3: Gráfico pizza */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-foreground">Distribuição de gastos</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={3} dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground flex-1">{d.name}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BLOCO 4: Sugestão inteligente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary/5 border border-primary/15 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Sugestão inteligente</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{sugestao}</p>
          <button
            onClick={() => navigate("/simulador")}
            className="text-sm font-semibold text-primary flex items-center gap-1"
          >
            Ver como <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Simulador link */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/simulador")}
          className="w-full bg-card rounded-2xl p-5 shadow-lg border border-border flex items-center gap-3 hover:shadow-xl transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-foreground text-sm">Simulador Financeiro</p>
            <p className="text-xs text-muted-foreground">E se eu economizar mais?</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
