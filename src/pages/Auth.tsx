import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Mail, Lock, ArrowLeft } from "lucide-react";
import { signIn, signUp, resetPassword } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        await resetPassword(email);
        toast({
          title: "E-mail enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
        setMode("login");
      } else if (mode === "login") {
        await signIn(email, senha);
        navigate("/dashboard");
      } else {
        await signUp(email, senha);
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "forgot" ? "Recuperar senha" : mode === "login" ? "Entrar" : "Criar conta";
  const subtitle = mode === "forgot"
    ? "Enviaremos um link para redefinir sua senha"
    : mode === "login"
    ? "Bem-vindo de volta ao GranaCasa"
    : "Comece a organizar suas finanças";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-bold rounded-xl h-12"
          >
            {loading
              ? "Aguarde..."
              : mode === "forgot"
              ? "Enviar link"
              : mode === "login"
              ? "Entrar"
              : "Criar conta"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-sm text-muted-foreground hover:text-foreground block mx-auto"
            >
              Esqueceu a senha?
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : mode === "login" ? "signup" : "login")}
            className="text-sm text-primary hover:underline"
          >
            {mode === "signup"
              ? "Já tem conta? Faça login"
              : mode === "login"
              ? "Não tem conta? Cadastre-se"
              : "Voltar para login"}
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </motion.div>
    </div>
  );
}