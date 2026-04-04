import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile, FinancialProfile, getTotalGastosFixos, getSaldo,
  getEntradaImovel, getMesesParaEntrada, getSaudeFinanceira,
  formatCurrency, formatTempoRestante, getCurrentLevel, getNextLevel,
  getLevelProgress, getTransactionStats, getMonthlyProjections,
  canUndo, canRedo, undo, redo, saveProfile, addXp, earnBadge,
} from "@/lib/financial-store";
import {
  TrendingUp, PiggyBank, Lightbulb, ChevronRight, Calculator,
  DollarSign, CreditCard, Wallet, Zap, Flame, Plus, Undo2, Redo2,
  ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { BottomNav } from "@/components/BottomNav";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { useToast } from "@/hooks/use-toast";

const HEALTH_MAP = {
  verde: { label: "Saudável", color: "text-success", bg: "bg-primary/10", emoji: "🟢" },
  amarelo: { label: "Atenção", color: "text-warning", bg: "bg-warning/10", emoji: "🟡" },
  vermelho: { label: "Crítico", color: "text-danger", bg: "bg-destructive/10", emoji: "🔴" },
};

const PIE_COLORS = [
  "hsl(142, 71%, 35%)", "hsl(217, 91%, 60%)", "hsl(38, 92%, 50%)",
  "hsl(280, 50%, 55%)", "hsl(0, 84%, 60%)", "hsl(180, 50%, 45%)", "hsl(320, 60%, 50%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [showAddTx, setShowAddTx] = useState(false);
  const [, setRefresh] = useState(0);

  const reload = useCallback(() => {
    const p = getProfile();
    setProfile(p);
    setRefresh(r => r + 1);
  }, []);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    // Check badges
    const txStats = getTransactionStats();
    let updated = p;
    if (txStats.count >= 1) updated = earnBadge(updated, "first_tx");
    if (txStats.count >= 10) updated = earnBadge(updated, "tx_10");
    if (updated !== p) { saveProfile(updated); }
    setProfile(updated);
  }, [navigate]);

  if (!profile) return null;

  const totalFixos = getTotalGastosFixos(profile);
  const totalGastos = totalFixos + profile.gastosVariaveis;
  const saldo = getSaldo(profile);
  const entrada = getEntradaImovel(profile);
  const meses = getMesesParaEntrada(profile);
  const saude = getSaudeFinanceira(profile);
  const healthInfo = HEALTH_MAP[saude];

  const xp = profile.xp || 0;
  const level = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const levelProg = getLevelProgress(xp);

  const progressPercent = Math.min((profile.totalEconomizado / entrada) * 100, 100);

  const txStats = getTransactionStats();
  const projections = getMonthlyProjections(profile, 6);

  const chartData = [
    { name: "Aluguel", value: profile.gastosFixos.aluguel },
    { name: "Luz", value: profile.gastosFixos.luz },
    { name: "Internet", value: profile.gastosFixos.internet },
    { name: "Transporte", value: profile.gastosFixos.transporte },
    { name: "Alimentação", value: profile.gastosFixos.alimentacao },
    { name: "Variáveis", value: profile.gastosVariaveis },
    { name: "Outros", value: profile.gastosFixos.outros },
  ].filter(d => d.value > 0);

  const economiaMensal = txStats.totalEntradas - txStats.totalSaidas;
  const previsaoEconomia = economiaMensal > 0 ? economiaMensal : Math.max(saldo * 0.5, profile.metaMensalEconomia || 0);
  const valorRestante = entrada - profile.totalEconomizado;
  const tempoParaMeta = economiaMensal > 0 ? Math.ceil(valorRestante / economiaMensal) : meses;

  const handleUndo = () => {
    const desc = undo();
    if (desc) { toast({ title: "Desfeito ↩️", description: desc }); reload(); }
  };
  const handleRedo = () => {
    const desc = redo();
    if (desc) { toast({ title: "Refeito ↪️", description: desc }); reload(); }
  };

  const handleTxAdded = () => {
    // Give XP for transaction
    let p = getProfile();
    p = addXp(p, 15);
    saveProfile(p);
    reload();
    toast({ title: "Transação registrada! ✅", description: "+15 XP" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-12 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Olá, {profile.nome || "Usuário"} 👋</p>
              <h1 className="text-xl font-bold text-primary-foreground">Meu painel</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleUndo} disabled={!canUndo()} className="p-2 rounded-full bg-primary-foreground/10 disabled:opacity-30">
                <Undo2 className="w-4 h-4 text-primary-foreground" />
              </button>
              <button onClick={handleRedo} disabled={!canRedo()} className="p-2 rounded-full bg-primary-foreground/10 disabled:opacity-30">
                <Redo2 className="w-4 h-4 text-primary-foreground" />
              </button>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${healthInfo.bg} ${healthInfo.color} border border-border/20`}>
                {healthInfo.emoji} {healthInfo.label}
              </div>
            </div>
          </div>
          {/* Level bar */}
          <div className="bg-primary-foreground/10 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">{level.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-primary-foreground">{level.name}</p>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary-foreground" />
                  <span className="text-[10px] font-bold text-primary-foreground">{xp} XP</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary-foreground rounded-full transition-all" style={{ width: `${levelProg}%` }} />
              </div>
              <p className="text-[9px] text-primary-foreground/60 mt-0.5">
                {nextLevel ? `Próximo: ${nextLevel.emoji} ${nextLevel.name}` : "Nível máximo!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-4">
        {/* Saldo atual do mês */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-sm">Saldo do mês</h3>
            </div>
            <span className={`text-lg font-bold ${txStats.saldoMes >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(txStats.saldoMes)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <div>
                <p className="text-[10px] text-muted-foreground">Entradas</p>
                <p className="text-sm font-bold text-success">{formatCurrency(txStats.totalEntradas)}</p>
              </div>
            </div>
            <div className="bg-destructive/5 rounded-xl p-3 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-danger" />
              <div>
                <p className="text-[10px] text-muted-foreground">Saídas</p>
                <p className="text-sm font-bold text-danger">{formatCurrency(txStats.totalSaidas)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Meta principal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
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
            <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <p className="text-xs text-muted-foreground">
            Faltam <span className="font-semibold text-foreground">{formatTempoRestante(meses)}</span>
          </p>
        </motion.div>

        {/* Resumo financeiro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Economia mensal</p>
            <p className={`text-sm font-bold ${economiaMensal >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(economiaMensal)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <CreditCard className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Tempo p/ meta</p>
            <p className="text-sm font-bold text-foreground">{tempoParaMeta > 0 ? `${tempoParaMeta} meses` : "—"}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <Wallet className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Previsão</p>
            <p className="text-sm font-bold text-success">{formatCurrency(previsaoEconomia)}/mês</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground mb-0.5">Receita</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(profile.rendaMensal)}</p>
          </div>
        </motion.div>

        {/* Projeção mensal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-foreground text-sm">Projeção de economia</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,85%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(0,0%,60%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(0,0%,60%)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="acumulado" stroke="hsl(142, 71%, 45%)" fill="url(#colorAcum)" strokeWidth={2} name="Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico pizza */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
                    {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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

        {/* Sugestão inteligente */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-primary/5 border border-primary/15 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Sugestão inteligente</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {profile.gastosVariaveis > profile.rendaMensal * 0.1
              ? `Você pode economizar ${formatCurrency(profile.gastosVariaveis * 0.3)} reduzindo gastos com delivery e lazer`
              : `Economizando ${formatCurrency(previsaoEconomia)}/mês, sua casa chega em ${formatTempoRestante(meses)}`}
          </p>
          <button onClick={() => navigate("/simulador")} className="text-sm font-semibold text-primary flex items-center gap-1">
            Ver como <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/simulador")} className="bg-card rounded-2xl p-4 shadow-lg border border-border flex items-center gap-3 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-xs">Simulador</p>
              <p className="text-[10px] text-muted-foreground">E se...?</p>
            </div>
          </button>
          <button onClick={() => navigate("/disciplina")} className="bg-card rounded-2xl p-4 shadow-lg border border-border flex items-center gap-3 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-xs">Disciplina</p>
              <p className="text-[10px] text-muted-foreground">90 dias 🔥</p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddTx(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gradient-primary shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      <AddTransactionDialog open={showAddTx} onClose={() => setShowAddTx(false)} onAdded={handleTxAdded} />
      <BottomNav />
    </div>
  );
}
