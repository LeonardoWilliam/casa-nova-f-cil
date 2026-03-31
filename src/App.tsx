import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Simulator from "./pages/Simulator.tsx";
import Goals from "./pages/Goals.tsx";
import Alerts from "./pages/Alerts.tsx";
import Expenses from "./pages/Expenses.tsx";
import Profile from "./pages/Profile.tsx";
import Discipline from "./pages/Discipline.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulador" element={<Simulator />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/alertas" element={<Alerts />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/disciplina" element={<Discipline />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
