-- NEW MIGRATION: 004_rbac_security.sql

-- First, ensure RLS is enabled on all critical tables
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos_guincho ENABLE ROW LEVEL SECURITY;
-- corridas already has RLS enabled from 003

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM perfis
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Policies for 'perfis' table
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON perfis;

CREATE POLICY "Usuários podem ver o próprio perfil"
ON perfis FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
ON perfis FOR SELECT
USING (is_admin());

CREATE POLICY "Admins podem inserir perfis"
ON perfis FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins podem atualizar todos os perfis"
ON perfis FOR UPDATE
USING (is_admin());

-- 2. Policies for 'corridas' table
-- (Note: 003 migration already added some basic policies, let's enhance them for Admin)

DROP POLICY IF EXISTS "Admins podem ver todas as corridas" ON corridas;
CREATE POLICY "Admins podem ver todas as corridas"
ON corridas FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Admins podem gerenciar todas as corridas" ON corridas;
CREATE POLICY "Admins podem gerenciar todas as corridas"
ON corridas FOR ALL
USING (is_admin());

-- 3. Policies for 'veiculos_guincho'
DROP POLICY IF EXISTS "Admins podem gerenciar veiculos" ON veiculos_guincho;
CREATE POLICY "Admins podem gerenciar veiculos"
ON veiculos_guincho FOR ALL
USING (is_admin());

CREATE POLICY "Motoristas podem ver seu proprio veiculo"
ON veiculos_guincho FOR SELECT
USING (perfil_id = auth.uid());
