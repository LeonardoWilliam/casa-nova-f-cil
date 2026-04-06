// API service - centralizes all Supabase interactions
import { supabase } from "@/integrations/supabase/client";

// === TRANSACTIONS ===
export async function fetchTransactions(userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("data", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTransaction(tx: {
  user_id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
}) {
  const { data, error } = await supabase.from("transactions").insert(tx).select().single();
  if (error) throw error;
  return data;
}

export async function removeTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// === GOALS ===
export async function fetchGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGoal(goal: {
  user_id: string;
  tipo: string;
  valor_total: number;
  valor_atual?: number;
  prazo_meses: number;
}) {
  const { data, error } = await supabase.from("goals").insert(goal).select().single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, updates: { valor_atual?: number; tipo?: string }) {
  const { data, error } = await supabase.from("goals").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function removeGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

// === MONTHLY SUMMARY ===
export async function fetchMonthlySummary(userId: string, mes?: string) {
  let query = supabase.from("monthly_summary").select("*").eq("user_id", userId);
  if (mes) query = query.eq("mes", mes);
  const { data, error } = await query.order("mes", { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertMonthlySummary(summary: {
  user_id: string;
  mes: string;
  total_entrada: number;
  total_saida: number;
  saldo: number;
}) {
  const { data, error } = await supabase
    .from("monthly_summary")
    .upsert(summary, { onConflict: "user_id,mes" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// === ACTIONS HISTORY ===
export async function logAction(action: {
  user_id: string;
  tipo_acao: string;
  entidade: string;
  dados_anteriores?: Record<string, unknown> | null;
  dados_novos?: Record<string, unknown> | null;
}) {
  const payload = {
    user_id: action.user_id,
    tipo_acao: action.tipo_acao,
    entidade: action.entidade,
    dados_anteriores: action.dados_anteriores as import("@/integrations/supabase/types").Json ?? null,
    dados_novos: action.dados_novos as import("@/integrations/supabase/types").Json ?? null,
  };
  const { error } = await supabase.from("actions_history").insert([payload]);
  if (error) throw error;
}

export async function fetchActionsHistory(userId: string) {
  const { data, error } = await supabase
    .from("actions_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
