import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useNavigate } from "react-router-dom";
import {
  FinancialProfile,
  saveProfile,
  getValorImovelSugerido,
  getSaldo,
} from "@/lib/financial-store";
import { Home, ArrowRight, ArrowLeft, Wallet, CreditCard, Target, Sparkles } from "lucide-react";

const STEPS = [
  { title: "Qual é sua renda mensal?", icon: Wallet, field: "renda" },
  { title: "Seus gastos fixos mensais", icon: CreditCard, field: "gastos" },
  { title: "Gastos variáveis e dívidas", icon: CreditCard, field: "extras" },
  { title: "Sua meta: comprar uma casa! 🏡", icon: Target, field: "meta" },
  { title: "Tudo pronto!", icon: Sparkles, field: "resumo" },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<FinancialProfile>({
    rendaMensal: 0,
    gastosFixos: { aluguel: 0, contas: 0, transporte: 0, alimentacao: 0, outros: 0 },
    gastosVariaveis: 0,
    dividas: 0,
    valorImovel: 250000,
    prazoAnos: 5,
    metaMensalEconomia: 0,
    onboardingCompleto: false,
  });

  const updateGasto = (key: keyof typeof profile.gastosFixos, val: number) => {
    setProfile((p) => ({ ...p, gastosFixos: { ...p.gastosFixos, [key]: val } }));
  };

  const canNext = () => {
    if (step === 0) return profile.rendaMensal > 0;
    return true;
  };

  const handleFinish = () => {
    const saldo = getSaldo(profile);
    const meta = Math.max(saldo * 0.5, 100);
    const finalProfile: FinancialProfile = {
      ...profile,
      metaMensalEconomia: meta,
      valorImovel: profile.valorImovel || getValorImovelSugerido(profile.rendaMensal),
      onboardingCompleto: true,
    };
    saveProfile(finalProfile);
    navigate("/dashboard");
  };

  const next = () => {
    if (step === STEPS.length - 1) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      {/* Progress bar */}
      <div className="w-full h-1 bg-primary-foreground/20">
        <motion.div
          className="h-full bg-primary-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <Home className="w-8 h-8 text-primary-foreground" />
          <span className="text-2xl font-bold text-primary-foreground">CasaMeta</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{STEPS[step].title}</h2>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Informe quanto você recebe por mês (salário líquido).
                  </p>
                  <CurrencyInput
                    value={profile.rendaMensal}
                    onChange={(v) => setProfile((p) => ({ ...p, rendaMensal: v }))}
                    placeholder="4.000,00"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Seus principais gastos fixos:</p>
                  {([
                    ["aluguel", "Aluguel"],
                    ["contas", "Contas (luz, água, internet)"],
                    ["transporte", "Transporte"],
                    ["alimentacao", "Alimentação"],
                    ["outros", "Outros fixos"],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <CurrencyInput
                        value={profile.gastosFixos[key]}
                        onChange={(v) => updateGasto(key, v)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Gastos variáveis estimados
                    </label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Lazer, compras, delivery, etc.
                    </p>
                    <CurrencyInput
                      value={profile.gastosVariaveis}
                      onChange={(v) => setProfile((p) => ({ ...p, gastosVariaveis: v }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Total de dívidas pendentes
                    </label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Cartão, empréstimos, etc. (0 se não tiver)
                    </p>
                    <CurrencyInput
                      value={profile.dividas}
                      onChange={(v) => setProfile((p) => ({ ...p, dividas: v }))}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Valor estimado do imóvel
                    </label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Sugestão com base na sua renda:{" "}
                      {getValorImovelSugerido(profile.rendaMensal).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <CurrencyInput
                      value={profile.valorImovel}
                      onChange={(v) => setProfile((p) => ({ ...p, valorImovel: v }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Prazo desejado (anos)
                    </label>
                    <div className="flex gap-2 mt-1">
                      {[3, 5, 7, 10].map((y) => (
                        <button
                          key={y}
                          onClick={() => setProfile((p) => ({ ...p, prazoAnos: y }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            profile.prazoAnos === y
                              ? "gradient-primary text-primary-foreground shadow-md"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {y} anos
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-center">
                  <div className="text-4xl">🏡</div>
                  <p className="text-foreground font-medium">
                    Seu plano está pronto! Vamos juntos conquistar sua casa.
                  </p>
                  <div className="bg-muted rounded-xl p-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renda</span>
                      <span className="font-semibold text-foreground">
                        {profile.rendaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sobra estimada</span>
                      <span className="font-semibold text-success">
                        {getSaldo(profile).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meta do imóvel</span>
                      <span className="font-semibold text-foreground">
                        {profile.valorImovel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrada (20%)</span>
                      <span className="font-semibold text-secondary">
                        {(profile.valorImovel * 0.2).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={prev}
                  className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
              )}
              <Button
                onClick={next}
                disabled={!canNext()}
                className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              >
                {step === STEPS.length - 1 ? "Começar!" : "Próximo"}
                {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
