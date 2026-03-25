# PRD - Moto Taxi & Delivery (Small Town Edition)

## 🎯 Visão Geral
Plataforma de mobilidade urbana e logística urbana voltada para pequenas cidades, otimizando o transporte de passageiros (Moto Táxi) e encomendas (Moto Boy). O foco é baixo custo operacional e alta performance em dispositivos móveis.

---

## 👥 Personas
1. **Passageiro / Remetente:** Usuário final que solicita corridas ou entregas via App.
2. **Motorista / Entregador:** Prestador de serviço que aceita solicitações e realiza o transporte.
3. **Administrador:** Gestor da plataforma que aprova cadastros, configura tarifas e monitora a operação via Web.

---

## 🛠️ Requisitos Funcionais

### 1. App do Passageiro (Mobile Only)
- **Solicitação Instantânea:** Rota ponto A ao B com escolha de categoria (Moto Táxi ou Entrega).
- **Agendamento:** Seleção de data e hora futura para corridas.
- **Acompanhamento em Tempo Real:** Visualização do motorista no mapa via WebSocket.
- **Pagamento In-App:** Integração com Mercado Pago (Cartão/PIX).
- **Histórico:** Consultar corridas passadas e recibos.
- **Perfil:** Cadastro e gestão de dados pessoais.

### 2. App do Motorista (Mobile Only)
- **Modo Online/Offline:** Controle de disponibilidade.
- **Recebimento de Chamados:** Notificações Push/In-app com detalhes da rota e valor.
- **Navegação:** Integração com Google Maps/Waze.
- **Rastreamento Inteligente:** Envio de localização em background para o Supabase.
- **Financeiro:** Extrato de ganhos e integração para saque.

### 3. Painel Administrativo (Web Only)
- **Gestão de Tarifas:** Configuração de preço base, valor por KM e taxas fixas por zona.
- **Aprovação de Motoristas:** Workflow de revisão de documentos (CNH, Documento da Moto).
- **Monitoramento Live:** Ver localização atual de todos os motoristas ativos no mapa.
- **Relatórios:** Dashboards de faturamento, volume de corridas e performance por motorista.

---

## 🏗️ Requisitos Técnicos & Arquitetura

### 1. Geolocalização Otimizada
- **Mobile SDKs:** Utilizar as APIs nativas de localização (gratuito).
- **Mapas:** Google Maps SDK (Mobile) para visualização (quota gratuita em apps nativos).
- **Backend:** Supabase Geog (PostGIS) para queries espaciais.

### 2. Comunicação Real-time
- **Supabase Realtime (WebSockets):** Utilizado para atualizar a posição do motorista no mapa do cliente sem requisições HTTP constantes.

### 3. Stack Tecnológica (Reuse do Guincho)
- **Mobile:** React Native (Expo) com NativeWind.
- **Web Admin:** Next.js + Shadcn UI.
- **Backend/DB:** Supabase (Auth, DB, Realtime, Storage).
- **Pagamentos:** Mercado Pago SDK.

---

## 📅 Roadmap Inicial
1. **Fase 1:** Setup da estrutura Supabase (Tabelas de Tarifas e Agendamentos).
2. **Fase 2:** Adaptação da UI do Passageiro (Seleção Moto Táxi vs Entrega).
3. **Fase 3:** Implementação do Fluxo de Agendamento.
4. **Fase 4:** Integração de Pagamento Mercado Pago.
5. **Fase 5:** Dashboard Admin de Aprovação e Configurações.
