import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Veja o arquivo .env.example."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Nome da linha única que guarda todo o estado do inventário (espelha a
// mesma estrutura { assets, categoryPhotos } usada antes no armazenamento
// interno do Claude — troca de "motor" sem precisar redesenhar os dados).
export const STATE_ROW_ID = "clube-alemao-inventario";

export async function loadAppState() {
  const { data, error } = await supabase
    .from("app_state")
    .select("data")
    .eq("id", STATE_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data?.data ?? null;
}

export async function saveAppState(stateObj) {
  const { error } = await supabase
    .from("app_state")
    .upsert({ id: STATE_ROW_ID, data: stateObj, updated_at: new Date().toISOString() });

  if (error) throw error;
  return true;
}
