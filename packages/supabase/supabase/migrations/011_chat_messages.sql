-- Tabela de mensagens do chat vinculada a corridas
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corrida_id UUID NOT NULL REFERENCES public.corridas(id) ON DELETE CASCADE,
    remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    lido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indice para performance nas consultas do chat por corrida
CREATE INDEX IF NOT EXISTS mensagens_chat_corrida_id_idx ON public.mensagens_chat(corrida_id);

-- Ativar RLS
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;

-- Politicas de RLS para mensagens_chat

-- 1. Leitura: Cliente ou Motorista envolvidos na corrida ou Admin podem ler
CREATE POLICY "Leitura de mensagens permitida para envolvidos e admin" ON public.mensagens_chat
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.corridas c
            WHERE c.id = mensagens_chat.corrida_id
            AND (c.cliente_id = auth.uid() OR c.motorista_id = auth.uid())
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- 2. Inserção: Criador da mensagem deve ser o remetente, estar na corrida, e a corrida não pode estar finalizada
CREATE POLICY "Inserção de mensagens permitida em corridas ativas" ON public.mensagens_chat
    FOR INSERT TO authenticated
    WITH CHECK (
        remetente_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.corridas c
            WHERE c.id = corrida_id
            AND (c.cliente_id = auth.uid() OR c.motorista_id = auth.uid())
            AND c.status NOT IN ('concluida', 'cancelada')
        )
    );

-- Habilitar o Realtime para a tabela mensagens_chat
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_chat;
