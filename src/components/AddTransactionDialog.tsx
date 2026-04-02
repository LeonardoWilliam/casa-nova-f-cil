import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { CATEGORIES, TransactionCategory, TransactionType, addTransaction } from "@/lib/financial-store";
import { CurrencyInput } from "./CurrencyInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddTransactionDialog({ open, onClose, onAdded }: Props) {
  const [type, setType] = useState<TransactionType>("saida");
  const [category, setCategory] = useState<TransactionCategory>("alimentacao");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);

  const cats = Object.entries(CATEGORIES).filter(([, c]) => c.type === type);

  const handleSubmit = () => {
    if (value <= 0 || !description.trim()) return;
    addTransaction({
      type,
      category,
      description: description.trim(),
      value,
      date: new Date().toISOString(),
    });
    setValue(0);
    setDescription("");
    onAdded();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Nova transação</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => { setType("saida"); setCategory("alimentacao"); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                type === "saida" ? "bg-destructive/10 text-destructive border-2 border-destructive/30" : "bg-muted text-muted-foreground border-2 border-transparent"
              }`}
            >
              <Minus className="w-4 h-4" /> Saída
            </button>
            <button
              onClick={() => { setType("entrada"); setCategory("salario"); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                type === "entrada" ? "bg-primary/10 text-primary border-2 border-primary/30" : "bg-muted text-muted-foreground border-2 border-transparent"
              }`}
            >
              <Plus className="w-4 h-4" /> Entrada
            </button>
          </div>

          {/* Value */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Valor</label>
            <CurrencyInput value={value} onChange={setValue} />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Mercado, Uber, Salário..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {cats.map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key as TransactionCategory)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    category === key
                      ? "bg-primary/10 border-2 border-primary/30"
                      : "bg-muted border-2 border-transparent"
                  }`}
                >
                  <span className="text-lg block">{cat.emoji}</span>
                  <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={value <= 0 || !description.trim()}
            className="w-full py-4 rounded-xl font-bold text-primary-foreground gradient-primary shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Registrar transação
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
