import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { ScoreBreakdown, getScoreLabel } from "@/store/userStore";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const { label, emoji, color } = getScoreLabel(score.total);

  const bars = [
    { label: "Economia", value: score.economia, max: 40, colorClass: "bg-primary" },
    { label: "Consistência", value: score.consistencia, max: 30, colorClass: "bg-secondary" },
    { label: "Controle", value: score.controleGastos, max: 30, colorClass: "bg-accent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-lg border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Score Financeiro</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{emoji}</span>
          <span className={`text-2xl font-black ${color}`}>{score.total}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <p className={`text-xs font-semibold mb-4 ${color}`}>{label}</p>

      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{bar.label}</span>
              <span className="font-semibold text-foreground">{bar.value}/{bar.max}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${bar.colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
