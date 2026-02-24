-- Adiciona colunas de detalhes do veículo à tabela de corridas
ALTER TABLE public.corridas
  ADD COLUMN IF NOT EXISTS veiculo_placa TEXT,
  ADD COLUMN IF NOT EXISTS veiculo_cor TEXT,
  ADD COLUMN IF NOT EXISTS veiculo_marca_modelo TEXT,
  ADD COLUMN IF NOT EXISTS problema_descricao TEXT,
  ADD COLUMN IF NOT EXISTS problema_tipo TEXT;

COMMENT ON COLUMN public.corridas.veiculo_placa IS 'Placa do veículo do cliente (Ex: ABC-1234)';
COMMENT ON COLUMN public.corridas.veiculo_cor IS 'Cor do veículo (Ex: Prata)';
COMMENT ON COLUMN public.corridas.veiculo_marca_modelo IS 'Marca e modelo do veículo (Ex: Toyota Corolla)';
COMMENT ON COLUMN public.corridas.problema_descricao IS 'Descrição detalhada do problema (Ex: O carro parou de funcionar...)';
COMMENT ON COLUMN public.corridas.problema_tipo IS 'Tipo do problema: Pane Mecânica, Colisão, Pneu Furado, Falta de Combustível';

-- Garantir acesso a essas colunas no RPC, Webhooks, e RLS já devem estar cobertos pela tabela
