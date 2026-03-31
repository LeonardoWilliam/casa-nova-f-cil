import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile,
  FinancialProfile,
  getEntradaImovel,
  formatCurrency,
} from "@/lib/financial-store";
import { ArrowLeft, Target, Home, Calculator, CheckCircle2, Circle, Lock } from "lucide-react";

interface SubMeta {
  title: string;
  description: string;
  target: number;
  progress: number;
  locked: boolean;
}

export default function Goals() {
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

  const entrada = getEntradaImovel(profile);
  const reservaEmergencia = profile.rendaMensal * 6;

  const subMetas: SubMeta[] = [
    {
      title: "Quitar dívidas",
      description: "Livre-se das dívidas para começar a economizar",
      target: profile.dividas,
      progress: profile.dividas > 0 ? 0.3 : 1,
      locked: false,
    },
    {
      title: "Reserva de emergência",
      description: `6 meses de renda: ${formatCurrency(reservaEmergencia)}`,
      target: reservaEmergencia,
      progress: profile.dividas > 0 ? 0 : 0.15,
      locked: profile.dividas > 0,
    },
    {
      title: "Entrada do imóvel",
      description: `20% do valor: ${formatCurrency(entrada)}`,
      target: entrada,
      progress: 0.05,
      locked: true,
    },
  ];

  const totalProgress =
    subMetas.reduce((acc, m) => acc + m.progress, 0) / subMetas.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Target className="w-6 h-6 text-primary-foreground" />
            <span className="text-lg font-bold text-primary-foreground">Minhas Metas</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Meta principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏡</div>
            <h2 className="text-xl font-bold text-foreground">Comprar minha casa</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Imóvel de {formatCurrency(profile.valorImovel)}
            </p>
          </div>

          <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {(totalProgress * 100).toFixed(0)}% do caminho completo
          </p>
        </motion.div>

        {/* Sub-metas */}
        {subMetas.map((meta, i) => (
          <motion.div
            key={meta.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className={`glass-card rounded-2xl p-5 ${meta.locked ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {meta.progress >= 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : meta.locked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Circle className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-sm">{meta.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                {meta.target > 0 && (
                  <>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3 mb-1">
                      <div
                        className="h-full gradient-primary rounded-full transition-all"
                        style={{ width: `${meta.progress * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{formatCurrency(meta.target * meta.progress)}</span>
                      <span>{formatCurrency(meta.target)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Motivational */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/5 rounded-2xl p-5 text-center"
        >
          <p className="text-sm text-foreground font-medium">
            💪 Cada real economizado te aproxima do seu sonho!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Continue firme, você está no caminho certo.
          </p>
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
            className="flex-1 py-3 flex flex-col items-center gap-1 text-muted-foreground"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-medium">Simulador</span>
          </button>
          <button
            onClick={() => navigate("/metas")}
            className="flex-1 py-3 flex flex-col items-center gap-1 text-primary"
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium">Metas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
