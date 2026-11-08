-- Migração 003 — CNPJ de organizadores e fornecedores.
-- Só para bancos criados antes desta coluna existir; o schema.sql já vem com ela.
-- Rodar uma vez: npm run db:migrar -- 003_cnpj_usuarios.sql
-- (rodar de novo dá erro de coluna duplicada, sem estragar nada)

ALTER TABLE usuarios
  ADD COLUMN cnpj CHAR(14) NULL AFTER email,  -- só os 14 dígitos, sem máscara
  ADD CONSTRAINT uq_usuarios_cnpj UNIQUE (cnpj),
  ADD CONSTRAINT ck_usuarios_cnpj CHECK (cnpj IS NULL OR cnpj REGEXP '^[0-9]{14}$');

-- CNPJs de teste dos usuários do seed.sql (não afeta usuários criados por você).
UPDATE usuarios SET cnpj = '11222333000181' WHERE id = 2 AND email = 'mariana@eventosmc.com.br';
UPDATE usuarios SET cnpj = '22333444000181' WHERE id = 3 AND email = 'rafael@lima-producoes.com';
UPDATE usuarios SET cnpj = '33444555000181' WHERE id = 4 AND email = 'contato@saboresdobrasil.com';
UPDATE usuarios SET cnpj = '44555666000181' WHERE id = 5 AND email = 'orcamento@somluz.com.br';
UPDATE usuarios SET cnpj = '55666777000181' WHERE id = 6 AND email = 'click@fotofilme.com';
UPDATE usuarios SET cnpj = '66777888000181' WHERE id = 7 AND email = 'comercial@seguratudo.com';
