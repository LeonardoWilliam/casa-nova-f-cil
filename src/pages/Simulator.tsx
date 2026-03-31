import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  getProfile,
  FinancialProfile,
  getEntradaImovel,
  getSaldo,
  formatCurrency,
} from "@/lib/financial-store";
import { ArrowLeft, Calculator, Home, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function Simulator() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [rendaExtra, setRendaExtra] = useState(0);
  const [corteGastos, setCorteGastos] = useState(0);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) {
      navigate("/");
      return;
    }
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
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Calculator className="w-6 h-6 text-primary-foreground" />
            <span className="text-lg font-bold text-primary-foreground">Simulador</span>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Veja como mudanças impactam sua meta.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Renda extra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-bold text-foreground">E se eu ganhar mais?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Renda extra mensal: <span className="font-bold text-foreground">{formatCurrency(rendaExtra)}</span>
          </p>
          <Slider
            value={[rendaExtra]}
            onValueChange={([v]) => setRendaExtra(v)}
            max={3000}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 0</span>
            <span>R$ 3.000</span>
          </div>
        </motion.div>

        {/* Cortar gastos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-foreground">E se eu gastar menos?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Redução mensal: <span className="font-bold text-foreground">{formatCurrency(corteGastos)}</span>
          </p>
          <Slider
            value={[corteGastos]}
            onValueChange={([v]) => setCorteGastos(v)}
            max={2000}
            step={50}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 0</span>
            <span>R$ 2.000</span>
          </div>
        </motion.div>

        {/* Resultado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="font-bold text-foreground mb-4">📊 Resultado da simulação</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Cenário atual</p>
              <p className="text-lg font-bold text-foreground">
                {mesesOriginal === Infinity ? "—" : `${mesesOriginal} meses`}
              </p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Com mudanças</p>
              <p className="text-lg font-bold text-primary">
                {mesesNovo === Infinity ? "—" : `${mesesNovo} meses`}
              </p>
            </div>
          </div>

          {diff > 0 && (
            <div className="bg-success/10 rounded-xl p-3 text-center">
              <p className="text-sm text-success font-semibold">
                🎉 Você antecipa sua casa em {diff} meses!
              </p>
            </div>
          )}

          {(rendaExtra > 0 || corteGastos > 0) && (
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Nova economia mensal: {formatCurrency(economia)}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-muted-foreground"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            onClick={() => navigate("/simulador")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-primary"
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
