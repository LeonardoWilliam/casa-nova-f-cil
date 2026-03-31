import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProfile, FinancialProfile, getExpenses, formatCurrency, getTotalGastosFixos } from "@/lib/financial-store";
import { ArrowLeft, Receipt } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function Expenses() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const expenses = getExpenses(profile);
  const total = getTotalGastosFixos(profile) + profile.gastosVariaveis;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Detalhes de Gastos</h1>
              <p className="text-xs text-primary-foreground/70">Total: {formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-3">
        {expenses.map((expense, i) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3"
          >
            <span className="text-2xl">{expense.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{expense.name}</p>
              <p className="text-xs text-muted-foreground">{expense.category}</p>
            </div>
            <p className="font-bold text-foreground text-sm">{formatCurrency(expense.value)}</p>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
