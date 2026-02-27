-- Migration: 013_fix_corridas_missing_columns.sql
-- Essa migração garante que a tabela 'corridas' tenha TODAS as colunas necessárias 
-- que estão sendo usadas no frontend ou definidas nos tipos, mas que podem ter falhado nas migrações anteriores.

DO $$ 
BEGIN
    -- Detalhes do Veículo e Problema (Migração 008 - Repetições seguras com IF NOT EXISTS)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='veiculo_placa') THEN
        ALTER TABLE public.corridas ADD COLUMN veiculo_placa TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='veiculo_cor') THEN
        ALTER TABLE public.corridas ADD COLUMN veiculo_cor TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='veiculo_marca_modelo') THEN
        ALTER TABLE public.corridas ADD COLUMN veiculo_marca_modelo TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='problema_descricao') THEN
        ALTER TABLE public.corridas ADD COLUMN problema_descricao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='problema_tipo') THEN
        ALTER TABLE public.corridas ADD COLUMN problema_tipo TEXT;
    END IF;

    -- Pagamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='metodo_pagamento') THEN
        ALTER TABLE public.corridas ADD COLUMN metodo_pagamento TEXT;
    END IF;

    -- Fotos e Inspeção (Checklist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='foto_veiculo_frente_url') THEN
        ALTER TABLE public.corridas ADD COLUMN foto_veiculo_frente_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='foto_veiculo_traseira_url') THEN
        ALTER TABLE public.corridas ADD COLUMN foto_veiculo_traseira_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='foto_veiculo_lateral_esq_url') THEN
        ALTER TABLE public.corridas ADD COLUMN foto_veiculo_lateral_esq_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='foto_veiculo_lateral_dir_url') THEN
        ALTER TABLE public.corridas ADD COLUMN foto_veiculo_lateral_dir_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='avarias_pre_existentes') THEN
        ALTER TABLE public.corridas ADD COLUMN avarias_pre_existentes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='assinatura_cliente_url') THEN
        ALTER TABLE public.corridas ADD COLUMN assinatura_cliente_url TEXT;
    END IF;

    -- Colunas de Negócio (Valor e Distância)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='valor_final') THEN
        ALTER TABLE public.corridas ADD COLUMN valor_final DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='corridas' AND column_name='distancia_texto') THEN
        ALTER TABLE public.corridas ADD COLUMN distancia_texto TEXT;
    END IF;

    -- Garantir colunas essenciais na tabela perfis para Motoristas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_active') THEN
        ALTER TABLE public.perfis ADD COLUMN is_active BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_online') THEN
        ALTER TABLE public.perfis ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Habilitar Realtime para a tabela corridas (CRÍTICO para o alerta do motorista)
-- Usamos o nome padrão 'supabase_realtime' que o cliente espera
DO $$
BEGIN
    -- Tenta adicionar a tabela à publicação padrão
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.corridas;
    ELSE
        -- Se não existir a padrão (raro no Supabase), cria uma específica
        CREATE PUBLICATION supabase_realtime FOR TABLE public.corridas;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Se já estiver na publicação, ignore o erro
        NULL;
END $$;

-- Comentários para documentação
COMMENT ON COLUMN public.perfis.is_active IS 'Status de aprovação administrativa do motorista';
COMMENT ON COLUMN public.perfis.is_online IS 'Status de disponibilidade em tempo real do motorista';
COMMENT ON COLUMN public.corridas.veiculo_placa IS 'Placa do veículo do cliente';
COMMENT ON COLUMN public.corridas.veiculo_cor IS 'Cor do veículo';
COMMENT ON COLUMN public.corridas.veiculo_marca_modelo IS 'Marca e modelo do veículo';
COMMENT ON COLUMN public.corridas.problema_descricao IS 'Descrição detalhada do problema';
COMMENT ON COLUMN public.corridas.problema_tipo IS 'Tipo do problema (Pane, Colisão, etc)';
COMMENT ON COLUMN public.corridas.metodo_pagamento IS 'Método de pagamento (pix, credit_card)';
COMMENT ON COLUMN public.corridas.valor_final IS 'Valor final da corrida calculado pelo sistema';
COMMENT ON COLUMN public.corridas.distancia_texto IS 'Distância formatada (ex: 5.2 km)';
