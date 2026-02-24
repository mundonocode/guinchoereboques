-- Adiciona colunas faltantes para o novo fluxo de onboarding de motoristas

-- Tabela: perfis
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS cnh_com_ear TEXT,
ADD COLUMN IF NOT EXISTS possui_conta_asaas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS asaas_wallet_id TEXT,
ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT, -- 'PF' ou 'PJ'
ADD COLUMN IF NOT EXISTS recebimento_nome TEXT,
ADD COLUMN IF NOT EXISTS recebimento_email TEXT,
ADD COLUMN IF NOT EXISTS recebimento_cnpj TEXT,
ADD COLUMN IF NOT EXISTS dados_bancarios TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status_verificacao TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS cnh_foto_url TEXT,
ADD COLUMN IF NOT EXISTS veiculo_foto_url TEXT;

-- Tabela: veiculos_guincho
ALTER TABLE public.veiculos_guincho
ADD COLUMN IF NOT EXISTS tipo_plataforma_v2 TEXT,
ADD COLUMN IF NOT EXISTS registro_antt TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.perfis.cnh_com_ear IS 'Número da CNH com observação EAR';
COMMENT ON COLUMN public.perfis.tipo_pessoa IS 'Tipo de pessoa para recebimento: PF ou PJ';
COMMENT ON COLUMN public.veiculos_guincho.tipo_plataforma_v2 IS 'Tipo de plataforma atualizado (ex: Hidráulica, Asa Delta)';
