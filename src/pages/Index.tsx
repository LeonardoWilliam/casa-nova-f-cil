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
    <div className="min-h-screen gradient-hero flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Home className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary-foreground mb-2">CasaMeta</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xs mx-auto">
            Seu planejador financeiro para conquistar a casa própria
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
              className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3"
            >
              <Icon className="w-5 h-5 text-primary-foreground" />
              <span className="text-sm text-primary-foreground font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => navigate("/onboarding")}
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8 rounded-xl shadow-lg"
          >
            Começar agora <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      <div className="text-center pb-6">
        <p className="text-primary-foreground/50 text-xs">
          Feito para brasileiros que sonham com a casa própria 🇧🇷
        </p>
      </div>
    </div>
  );
}
