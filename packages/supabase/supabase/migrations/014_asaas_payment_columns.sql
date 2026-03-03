-- Migration: 014_asaas_payment_columns.sql
-- Adiciona colunas para rastrear pagamentos do Asaas na tabela de corridas

ALTER TABLE public.corridas 
ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_payment_status TEXT;

COMMENT ON COLUMN public.corridas.asaas_payment_id IS 'ID do pagamento gerado no Asaas';
COMMENT ON COLUMN public.corridas.asaas_payment_status IS 'Status do pagamento retornado pelo Asaas (ex: CONFIRMED, RECEIVED, OVERDUE)';
