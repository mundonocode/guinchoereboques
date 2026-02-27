-- Cria os buckets de storage necessários se não existirem
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket 'documentos'
-- Permite leitura pública
CREATE POLICY "Documentos são públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos');

-- Permite upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de documentos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documentos' AND auth.role() = 'authenticated');

-- Policies para o bucket 'avatars'
-- Permite leitura pública
CREATE POLICY "Avatars são públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Permite upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
