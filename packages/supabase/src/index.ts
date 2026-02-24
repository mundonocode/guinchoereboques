import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export * from './types';

// Opcional: client padrão caso queira usar as credenciais diretamente do .env em node
export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient<Database>(supabaseUrl, supabaseKey);
};
