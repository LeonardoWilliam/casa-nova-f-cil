import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile,
  FinancialProfile,
  getEntradaImovel,
  formatCurrency,
} from "@/lib/financial-store";
import { ArrowLeft, Target, CheckCircle2, Circle, Lock, Home, Flame } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

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
    if (!p.onboardingCompleto) { navigate("/"); return; }
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

  const totalProgress = subMetas.reduce((acc, m) => acc + m.progress, 0) / subMetas.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-primary-foreground">Minhas Metas</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Meta principal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏠</div>
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
          <motion.div key={meta.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className={`bg-card rounded-2xl p-5 shadow-lg border border-border ${meta.locked ? "opacity-60" : ""}`}>
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
                      <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${meta.progress * 100}%` }} />
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

        {/* Modo Disciplina 90 dias */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/disciplina")}
          className="w-full bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 text-center hover:bg-primary/10 transition-colors"
        >
          <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-bold text-foreground">🔥 Modo Disciplina 90 Dias</h3>
          <p className="text-xs text-muted-foreground mt-1">Desafio diário para acelerar sua meta</p>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-primary/5 rounded-2xl p-5 text-center">
          <p className="text-sm text-foreground font-medium">
            💪 Cada real economizado te aproxima do seu sonho!
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
