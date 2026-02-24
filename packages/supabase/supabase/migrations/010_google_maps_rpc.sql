-- Cria uma função segura (Security Definer) que ignora RLS para buscar apenas a chave pública
-- Isso impede que Motoristas e Clientes acessem outras chaves sensíveis (como a do Asaas) na tabela configuracoes

CREATE OR REPLACE FUNCTION public.get_google_maps_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
BEGIN
  SELECT google_maps_api_key INTO api_key FROM public.configuracoes LIMIT 1;
  RETURN api_key;
END;
$$;

-- Dá permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_google_maps_key() TO authenticated;
