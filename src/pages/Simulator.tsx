import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import {
  getProfile,
  FinancialProfile,
  getEntradaImovel,
  getSaldo,
  formatCurrency,
  formatTempoRestante,
} from "@/lib/financial-store";
import { ArrowLeft, TrendingUp, TrendingDown, Home } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function Simulator() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [rendaExtra, setRendaExtra] = useState(0);
  const [corteGastos, setCorteGastos] = useState(0);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const saldoOriginal = getSaldo(profile);
  const novoSaldo = saldoOriginal + rendaExtra + corteGastos;
  const economia = Math.max(novoSaldo * 0.5, 0);
  const entrada = getEntradaImovel(profile);
  const mesesOriginal = saldoOriginal > 0 ? Math.ceil(entrada / (saldoOriginal * 0.5)) : Infinity;
  const mesesNovo = economia > 0 ? Math.ceil(entrada / economia) : Infinity;
  const diff = mesesOriginal - mesesNovo;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Simulador</h1>
              <p className="text-xs text-primary-foreground/70">E se você economizar mais?</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-bold text-foreground">E se eu ganhar mais?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Renda extra: <span className="font-bold text-foreground">{formatCurrency(rendaExtra)}</span>
          </p>
          <Slider value={[rendaExtra]} onValueChange={([v]) => setRendaExtra(v)} max={3000} step={100} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 0</span><span>R$ 3.000</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-foreground">E se eu gastar menos?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Redução: <span className="font-bold text-foreground">{formatCurrency(corteGastos)}</span>
          </p>
          <Slider value={[corteGastos]} onValueChange={([v]) => setCorteGastos(v)} max={2000} step={50} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 0</span><span>R$ 2.000</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <h3 className="font-bold text-foreground mb-4">📊 Resultado</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Cenário atual</p>
              <p className="text-lg font-bold text-foreground">{formatTempoRestante(mesesOriginal)}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Com mudanças</p>
              <p className="text-lg font-bold text-primary">{formatTempoRestante(mesesNovo)}</p>
            </div>
          </div>
          {diff > 0 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-primary">
                🔥 Você antecipa sua casa em {formatTempoRestante(diff)}!
              </p>
            </motion.div>
          )}
          {(rendaExtra > 0 || corteGastos > 0) && (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Nova economia mensal: {formatCurrency(economia)}
            </p>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
