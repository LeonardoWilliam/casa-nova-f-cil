import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  FinancialProfile,
  saveProfile,
  getValorImovelSugerido,
  getSaldo,
} from "@/lib/financial-store";
import { ArrowRight, ArrowLeft, Wallet, CreditCard, AlertCircle, Clock, Home } from "lucide-react";

const STEPS = [
  { title: "Qual é seu nome?", subtitle: "Para personalizar sua experiência", icon: Home },
  { title: "Quanto você ganha por mês?", subtitle: "Informe seu salário líquido", icon: Wallet },
  { title: "Seus gastos fixos?", subtitle: "Principais contas mensais", icon: CreditCard },
  { title: "Você tem dívidas?", subtitle: "Cartão, empréstimos, etc.", icon: AlertCircle },
  { title: "Em quanto tempo quer comprar sua casa?", subtitle: "Escolha seu prazo ideal", icon: Clock },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<FinancialProfile>({
    nome: "",
    rendaMensal: 0,
    gastosFixos: { aluguel: 0, luz: 0, internet: 0, transporte: 0, alimentacao: 0, outros: 0 },
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
    xp: 0,
    badges: [],
  });

  const updateGasto = (key: keyof typeof profile.gastosFixos, val: number) => {
    setProfile((p) => ({ ...p, gastosFixos: { ...p.gastosFixos, [key]: val } }));
  };

  const canNext = () => {
    if (step === 0) return profile.nome.trim().length > 0;
    if (step === 1) return profile.rendaMensal > 0;
    return true;
  };

  const handleFinish = () => {
    const saldo = getSaldo(profile);
    const meta = Math.max(saldo * 0.5, 100);
    const valorImovel = profile.valorImovel || getValorImovelSugerido(profile.rendaMensal);
    const finalProfile: FinancialProfile = {
      ...profile,
      metaMensalEconomia: meta,
      valorImovel,
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted">
        <motion.div
          className="h-full gradient-primary"
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
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">GranaCasa</span>
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
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{STEPS[step].title}</h2>
                  <p className="text-xs text-muted-foreground">{STEPS[step].subtitle}</p>
                </div>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <Input
                    value={profile.nome}
                    onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Seu nome"
                    className="text-base h-12 rounded-xl"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <CurrencyInput
                    value={profile.rendaMensal}
                    onChange={(v) => setProfile((p) => ({ ...p, rendaMensal: v }))}
                    placeholder="4.000,00"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {([
                    ["aluguel", "Aluguel"],
                    ["luz", "Luz"],
                    ["internet", "Internet"],
                    ["transporte", "Transporte"],
                    ["alimentacao", "Alimentação"],
                    ["outros", "Outros"],
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

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProfile((p) => ({ ...p, temDividas: true }))}
                      className={`flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                        profile.temDividas
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setProfile((p) => ({ ...p, temDividas: false, dividas: 0 }))}
                      className={`flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                        !profile.temDividas
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                  {profile.temDividas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-sm font-medium text-foreground">Total de dívidas</label>
                      <CurrencyInput
                        value={profile.dividas}
                        onChange={(v) => setProfile((p) => ({ ...p, dividas: v }))}
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[3, 5, 10].map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          const valorImovel = getValorImovelSugerido(profile.rendaMensal);
                          setProfile((p) => ({ ...p, prazoAnos: y, valorImovel }));
                        }}
                        className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all ${
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
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={prev}
                  className="flex-1 rounded-xl h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
              )}
              <Button
                onClick={next}
                disabled={!canNext()}
                className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 font-semibold rounded-xl h-12"
              >
                {step === STEPS.length - 1 ? "Montar meu plano 🚀" : "Próximo"}
                {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? "bg-primary w-6" : i < step ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
