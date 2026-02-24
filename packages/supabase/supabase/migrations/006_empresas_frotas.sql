-- Migration 006: Gestão de Frotas (Empresas)

-- Cria a tabela de empresas (frotas)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cnpj TEXT UNIQUE NOT NULL,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    email_contato TEXT,
    telefone_contato TEXT,
    possui_conta_asaas BOOLEAN DEFAULT false,
    asaas_wallet_id TEXT,
    dados_bancarios TEXT,
    dono_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL, -- Admin/Dono da frota
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativa RLS na tabela de empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Adiciona a coluna empresa_id na tabela de perfis
ALTER TABLE public.perfis
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL;

-- Atualiza RLS para perfis (permite que donos de empresa vejam perfis da sua empresa)
-- Se o motorista tem empresa_id = X, o admin que é dono_id = Y da empresa X pode ver? 
-- (Políticas RLS complexas podem ser refinadas no futuro, mas por enquanto, manteremos o padrão de usuário ver seu próprio perfil e admin ver tudo)

-- Políticas básicas de empresas
CREATE POLICY "Admins podem gerenciar empresas"
    ON public.empresas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis
            WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
        )
    );

CREATE POLICY "Motoristas podem ver sua prõpria empresa"
    ON public.empresas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis
            WHERE perfis.id = auth.uid() AND perfis.empresa_id = empresas.id
        )
    );

-- Comentários documentando as colunas
COMMENT ON TABLE public.empresas IS 'Tabela que armazena dados das transportadoras/frotas parceiras.';
COMMENT ON COLUMN public.perfis.empresa_id IS 'Referência para a empresa/frota a qual o motorista pertence. Nulo se for autônomo.';
