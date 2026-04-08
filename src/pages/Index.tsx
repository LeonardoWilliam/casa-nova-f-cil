import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/financial-store";
import { Home, ArrowRight, Shield, Target, TrendingUp } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const p = getProfile();
    if (p.onboardingCompleto) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl gradient-hero flex items-center justify-center mx-auto mb-5 shadow-xl animate-pulse-glow">
            <Home className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black text-foreground mb-3">GranaCasa</h1>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Sua casa começa com um plano
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2 max-w-xs mx-auto">
            Organize seu dinheiro e descubra quando você pode sair do aluguel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3 mb-10 w-full max-w-xs"
        >
          {[
            { icon: Shield, text: "Organize suas finanças" },
            { icon: Target, text: "Crie metas realistas" },
            { icon: TrendingUp, text: "Simule cenários" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 w-full max-w-xs"
        >
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 font-bold text-base rounded-xl shadow-lg h-14"
          >
            Começar agora <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Já tenho conta
          </button>
        </motion.div>
      </div>

      <div className="text-center pb-6">
        <p className="text-muted-foreground/50 text-xs">
          Feito para brasileiros que sonham com a casa própria 🇧🇷
        </p>
      </div>
    </div>
  );
}
