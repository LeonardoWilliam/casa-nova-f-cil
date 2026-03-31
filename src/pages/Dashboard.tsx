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
} from "@/lib/financial-store";
import {
  Home,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Calculator,
  Lightbulb,
  ChevronRight,
  Target,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const HEALTH_MAP = {
  verde: { label: "Saudável", color: "text-success", bg: "bg-success/10", emoji: "💚" },
  amarelo: { label: "Atenção", color: "text-warning", bg: "bg-warning/10", emoji: "💛" },
  vermelho: { label: "Crítico", color: "text-danger", bg: "bg-danger/10", emoji: "❤️‍🔥" },
};

const PIE_COLORS = [
  "hsl(152, 58%, 38%)",
  "hsl(210, 65%, 50%)",
  "hsl(43, 96%, 56%)",
  "hsl(280, 50%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(180, 50%, 45%)",
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
  const saldo = getSaldo(profile);
  const entrada = getEntradaImovel(profile);
  const meses = getMesesParaEntrada(profile);
  const saude = getSaudeFinanceira(profile);
  const healthInfo = HEALTH_MAP[saude];

  const chartData = [
    { name: "Aluguel", value: profile.gastosFixos.aluguel },
    { name: "Contas", value: profile.gastosFixos.contas },
    { name: "Transporte", value: profile.gastosFixos.transporte },
    { name: "Alimentação", value: profile.gastosFixos.alimentacao },
    { name: "Variáveis", value: profile.gastosVariaveis },
    { name: "Outros", value: profile.gastosFixos.outros },
  ].filter((d) => d.value > 0);

  const progressPercent = Math.min(
    ((profile.metaMensalEconomia * 3) / entrada) * 100,
    100
  ); // simulate 3 months progress

  const dicas = [];
  if (profile.gastosVariaveis > profile.rendaMensal * 0.15) {
    dicas.push(
      `Seus gastos variáveis representam ${Math.round((profile.gastosVariaveis / profile.rendaMensal) * 100)}% da renda. Tente reduzir para 15%.`
    );
  }
  if (profile.dividas > 0) {
    dicas.push(
      `Quite suas dívidas de ${formatCurrency(profile.dividas)} primeiro. Isso libera mais para economizar.`
    );
  }
  if (saldo > 0) {
    const extra = Math.round(saldo * 0.1);
    const mesesAntes = Math.max(1, Math.round((entrada / (profile.metaMensalEconomia + extra)) - meses) * -1);
    dicas.push(
      `Economizando mais ${formatCurrency(extra)}/mês, você antecipa sua casa em ~${mesesAntes} meses.`
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary-foreground" />
              <span className="text-lg font-bold text-primary-foreground">CasaMeta</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${healthInfo.bg} ${healthInfo.color}`}>
              {healthInfo.emoji} {healthInfo.label}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary-foreground"
          >
            <p className="text-sm opacity-80">Sobra mensal estimada</p>
            <p className="text-3xl font-bold">{formatCurrency(saldo)}</p>
            <p className="text-xs opacity-60 mt-1">
              de {formatCurrency(profile.rendaMensal)} de renda
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {/* Meta da casa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Meta: Comprar minha casa</h3>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Entrada necessária</span>
            <span className="font-semibold text-foreground">{formatCurrency(entrada)}</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercent.toFixed(0)}% acumulado</span>
            <span>~{meses} meses restantes</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Economizando <span className="font-semibold text-primary">{formatCurrency(profile.metaMensalEconomia)}</span>/mês
          </div>
        </motion.div>

        {/* Gráfico de gastos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-foreground">Seus gastos</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
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
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground flex-1">{d.name}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
            <span className="text-muted-foreground">Total de gastos</span>
            <span className="font-bold text-foreground">
              {formatCurrency(totalFixos + profile.gastosVariaveis)}
            </span>
          </div>
        </motion.div>

        {/* Dicas inteligentes */}
        {dicas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-foreground">Dicas inteligentes</h3>
            </div>
            <div className="space-y-2">
              {dicas.map((dica, i) => (
                <div key={i} className="flex gap-2 items-start text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{dica}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Simulador link */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/simulador")}
          className="w-full glass-card rounded-2xl p-5 flex items-center gap-3 hover:shadow-xl transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-foreground text-sm">Simulador Financeiro</p>
            <p className="text-xs text-muted-foreground">E se eu aumentar minha renda?</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-primary"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            onClick={() => navigate("/simulador")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-muted-foreground"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-medium">Simulador</span>
          </button>
          <button
            onClick={() => navigate("/metas")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-muted-foreground"
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium">Metas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
