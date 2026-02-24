-- Migration 007: Checklist de Embarque

-- Adiciona colunas para armazenar o checklist na tabela de corridas
ALTER TABLE public.corridas
ADD COLUMN IF NOT EXISTS foto_veiculo_frente_url TEXT,
ADD COLUMN IF NOT EXISTS foto_veiculo_traseira_url TEXT,
ADD COLUMN IF NOT EXISTS foto_veiculo_lateral_esq_url TEXT,
ADD COLUMN IF NOT EXISTS foto_veiculo_lateral_dir_url TEXT,
ADD COLUMN IF NOT EXISTS avarias_pre_existentes TEXT,
ADD COLUMN IF NOT EXISTS assinatura_cliente_url TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.corridas.foto_veiculo_frente_url IS 'URL da foto da frente do veículo no momento do embarque';
COMMENT ON COLUMN public.corridas.foto_veiculo_traseira_url IS 'URL da foto da traseira do veículo no momento do embarque';
COMMENT ON COLUMN public.corridas.foto_veiculo_lateral_esq_url IS 'URL da foto da lateral esquerda do veículo no momento do embarque';
COMMENT ON COLUMN public.corridas.foto_veiculo_lateral_dir_url IS 'URL da foto da lateral direita do veículo no momento do embarque';
COMMENT ON COLUMN public.corridas.avarias_pre_existentes IS 'Descrição preenchida pelo motorista sobre avarias encontradas antes do transporte';
COMMENT ON COLUMN public.corridas.assinatura_cliente_url IS 'URL da imagem da assinatura do cliente confirmando o checklist';
