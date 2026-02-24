-- Cria tabela configuracoes caso nao exista
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asaas_api_key TEXT,
    split_percentage NUMERIC(5, 2) DEFAULT 15.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita RLS  para a tabela
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- As configurações só devem ser vistas e alteradas por administradores
CREATE POLICY "Admins_View_Configuracoes" ON public.configuracoes
    FOR SELECT USING (auth.uid() IN (SELECT id FROM public.perfis WHERE role = 'admin'));

CREATE POLICY "Admins_Manage_Configuracoes" ON public.configuracoes
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.perfis WHERE role = 'admin'));

-- Insere um registro default se não houver
INSERT INTO public.configuracoes (split_percentage) 
SELECT 15.00
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes);

-- Trigger de updated_at para configuracoes
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Tabela: perfis
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS recebimento_asaas_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_status TEXT DEFAULT 'PENDING';

COMMENT ON COLUMN public.perfis.recebimento_asaas_id IS 'ID da conta (wallet) Asaas para recebimentos do Motorista';
COMMENT ON COLUMN public.perfis.asaas_status IS 'Status da conta Asaas: PENDING, ACTIVE, REJECTED';

