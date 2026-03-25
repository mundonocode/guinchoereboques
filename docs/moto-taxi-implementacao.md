# Plano de Implementação - Moto Taxi

Este plano detalha as mudanças técnicas para transformar a base do "Guincho" no novo App de Moto Táxi.

## 🛠️ Mudanças Propostas

### 📋 [DB / Supabase]
- **Tabela `corridas`:** Adicionar coluna `tipo_servico` (enum: 'passageiro', 'entrega').
- **Tabela `agendamentos` [NEW]:** Criar tabela para armazenar solicitações futuras (`passageiro_id`, `data_hora`, `origem`, `destino`, `status`).
- **Tabela `configuracoes_tarifas` [NEW]:** Armazenar valores configuráveis pelo Admin (`preco_base`, `valor_km`, `taxa_agendamento`, `taxa_entrega`).
- **RLS:** Ajustar políticas para os novos fluxos de segurança.

### 📱 [App Mobile - Client & Driver]
- **Geolocalização:** Refatorar o hook de localização para garantir o envio via WebSocket ao Supabase em intervalos inteligentes para economizar bateria e API.
- **Mercado Pago:** Substituir/Adicionar integração Mercado Pago no fluxo de checkout.
- **Interface de Solicitação:** Atualizar o `BottomSheet` para incluir a opção de "Entrega".

### 💻 [Painel Admin]
- **Módulo de Configuração:** Criar página para ajuste de tarifas em tempo real.
- **Fluxo de Aprovação:** Criar fila de pendentes para novos motoristas com visualização de anexos (Supabase Storage).

## ✅ Plano de Verificação

### Testes Automatizados
- Simulação de cálculo de tarifa baseado em KM vs Configuração Admin.
- Teste de persistência de localização em background.

### Verificação Manual
- Fluxo completo: Solicitar agendamento -> Admin Aprova -> Motorista Recebe alerta no horário.
- Teste de checkout com Sandbox do Mercado Pago.
