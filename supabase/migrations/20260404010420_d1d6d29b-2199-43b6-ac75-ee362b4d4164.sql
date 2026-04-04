
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==================== TRANSACTIONS ====================
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  categoria TEXT NOT NULL,
  descricao TEXT,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_data ON public.transactions(data);
CREATE INDEX idx_transactions_categoria ON public.transactions(categoria);

-- ==================== GOALS ====================
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  valor_total NUMERIC(12,2) NOT NULL CHECK (valor_total > 0),
  valor_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
  prazo_meses INTEGER NOT NULL CHECK (prazo_meses > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_goals_user_id ON public.goals(user_id);

-- ==================== ACTIONS HISTORY ====================
CREATE TABLE public.actions_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_acao TEXT NOT NULL CHECK (tipo_acao IN ('create', 'update', 'delete')),
  entidade TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actions_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.actions_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own actions" ON public.actions_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_actions_history_user_id ON public.actions_history(user_id);
CREATE INDEX idx_actions_history_created_at ON public.actions_history(created_at);

-- ==================== MONTHLY SUMMARY ====================
CREATE TABLE public.monthly_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  total_entrada NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_saida NUMERIC(12,2) NOT NULL DEFAULT 0,
  saldo NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes)
);

ALTER TABLE public.monthly_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries" ON public.monthly_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own summaries" ON public.monthly_summary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own summaries" ON public.monthly_summary FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_summary_updated_at BEFORE UPDATE ON public.monthly_summary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_monthly_summary_user_id ON public.monthly_summary(user_id);
CREATE INDEX idx_monthly_summary_mes ON public.monthly_summary(mes);
