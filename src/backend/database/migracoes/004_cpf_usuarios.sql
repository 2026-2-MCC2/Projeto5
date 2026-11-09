-- Migração 004 — CPF como opção do organizador (pessoa física).
-- Só para bancos criados antes desta coluna existir; o schema.sql já vem com ela.
-- Precisa da 003 (coluna cnpj) aplicada antes.
-- Rodar uma vez: npm run db:migrar -- 004_cpf_usuarios.sql
-- (rodar de novo dá erro de coluna duplicada, sem estragar nada)

ALTER TABLE usuarios
  ADD COLUMN cpf CHAR(11) NULL AFTER cnpj,  -- só os 11 dígitos, sem máscara
  ADD CONSTRAINT uq_usuarios_cpf UNIQUE (cpf),
  ADD CONSTRAINT ck_usuarios_cpf CHECK (cpf IS NULL OR cpf REGEXP '^[0-9]{11}$'),
  ADD CONSTRAINT ck_usuarios_um_documento CHECK (cnpj IS NULL OR cpf IS NULL);
