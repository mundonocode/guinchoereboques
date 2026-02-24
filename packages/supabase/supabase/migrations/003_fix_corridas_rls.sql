-- Enable RLS if not already enabled
ALTER TABLE corridas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any restrict insertion
DROP POLICY IF EXISTS "Clientes podem criar próprias corridas" ON corridas;
DROP POLICY IF EXISTS "Motoristas podem ver corridas atribuídas ou disponíveis" ON corridas;
DROP POLICY IF EXISTS "Motoristas podem atualizar corridas atribuídas" ON corridas;
DROP POLICY IF EXISTS "Clientes podem ver próprias corridas" ON corridas;
DROP POLICY IF EXISTS "Clientes podem atualizar próprias corridas" ON corridas;

-- Policies for Clientes (Client Users)
CREATE POLICY "Clientes podem criar próprias corridas" 
ON corridas FOR INSERT 
WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Clientes podem ver próprias corridas" 
ON corridas FOR SELECT 
USING (auth.uid() = cliente_id);

CREATE POLICY "Clientes podem atualizar próprias corridas" 
ON corridas FOR UPDATE 
USING (auth.uid() = cliente_id);

-- Policies for Motoristas (Drivers)
CREATE POLICY "Motoristas podem ver corridas atribuídas ou disponíveis" 
ON corridas FOR SELECT 
USING (auth.uid() = motorista_id OR status = 'buscando_motorista');

CREATE POLICY "Motoristas podem atualizar corridas atribuídas" 
ON corridas FOR UPDATE 
USING (auth.uid() = motorista_id);
