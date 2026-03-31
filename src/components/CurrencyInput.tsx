import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({ value, onChange, placeholder, className }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(Number(raw) / 100);
  };

  const formatted = value
    ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
        R$
      </span>
      <Input
        type="text"
        inputMode="numeric"
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder || "0,00"}
        className={`pl-10 ${className || ""}`}
      />
    </div>
  );
}
