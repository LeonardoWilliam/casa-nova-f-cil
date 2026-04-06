import { Crown, Sparkles } from "lucide-react";
import { UserPlan } from "@/store/userStore";

interface PlanBadgeProps {
  plan: UserPlan;
  className?: string;
}

export function PlanBadge({ plan, className = "" }: PlanBadgeProps) {
  if (plan === "premium") {
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 ${className}`}>
        <Crown className="w-3 h-3 text-warning" />
        <span className="text-[10px] font-bold text-warning">PREMIUM</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border ${className}`}>
      <Sparkles className="w-3 h-3 text-muted-foreground" />
      <span className="text-[10px] font-bold text-muted-foreground">FREE</span>
    </div>
  );
}
