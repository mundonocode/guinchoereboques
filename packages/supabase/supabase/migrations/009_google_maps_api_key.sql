-- Adiciona a coluna para a API Key do Google Maps
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS google_maps_api_key TEXT;

COMMENT ON COLUMN public.configuracoes.google_maps_api_key IS 'Chave de API do Google Maps usada nos aplicativos e na versão Web PWA';

-- Insere a chave do Google Maps buscada do .env do mobile
UPDATE public.configuracoes
SET google_maps_api_key = 'AIzaSyBu83g8sbDBVBFC4H3UP3VR71Y3LfiTW7w'
WHERE id IS NOT NULL;
