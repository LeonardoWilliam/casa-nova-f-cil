import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calculator, Target, Bell, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", icon: Home, label: "Início" },
  { path: "/simulador", icon: Calculator, label: "Simulador" },
  { path: "/metas", icon: Target, label: "Metas" },
  { path: "/alertas", icon: Bell, label: "Alertas" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
