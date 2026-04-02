import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProfile, FinancialProfile, getExpenses, formatCurrency,
  getTotalGastosFixos, getTransactions, Transaction, CATEGORIES,
  deleteTransaction, canUndo, undo,
} from "@/lib/financial-store";
import { ArrowLeft, Receipt, Trash2, Undo2, Clock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

export default function Expenses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<"fixos" | "transacoes">("transacoes");

  const reload = () => {
    setProfile(getProfile());
    setTransactions(getTransactions());
  };

  useEffect(() => {
    const p = getProfile();
    if (!p.onboardingCompleto) { navigate("/"); return; }
    setProfile(p);
    setTransactions(getTransactions());
  }, [navigate]);

  if (!profile) return null;

  const expenses = getExpenses(profile);
  const total = getTotalGastosFixos(profile) + profile.gastosVariaveis;

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({ title: "Transação removida", description: "Use desfazer para recuperar" });
    reload();
  };

  const handleUndo = () => {
    const desc = undo();
    if (desc) { toast({ title: "Desfeito ↩️", description: desc }); reload(); }
  };

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
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary-foreground">Movimentações</h1>
              <p className="text-xs text-primary-foreground/70">Fixos: {formatCurrency(total)} | {transactions.length} transações</p>
            </div>
            {canUndo() && (
              <button onClick={handleUndo} className="p-2 rounded-full bg-primary-foreground/10">
                <Undo2 className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("transacoes")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "transacoes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Transações
          </button>
          <button onClick={() => setTab("fixos")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "fixos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Gastos Fixos
          </button>
        </div>

        {tab === "fixos" && (
          <div className="space-y-3">
            {expenses.map((expense, i) => (
              <motion.div key={expense.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
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
        )}

        {tab === "transacoes" && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Nenhuma transação ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Use o botão + no dashboard para adicionar</p>
              </div>
            ) : (
              transactions.map((tx, i) => {
                const cat = CATEGORIES[tx.category];
                const isEntry = tx.type === "entrada";
                return (
                  <motion.div key={tx.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{cat.label} • {new Date(tx.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isEntry ? "text-success" : "text-danger"}`}>
                        {isEntry ? "+" : "-"}{formatCurrency(tx.value)}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
