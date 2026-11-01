-- Migração 001 — adiciona a categoria do evento (Corporativo, Casamento, ...).
-- Só para bancos criados antes desta coluna existir; o schema.sql já vem com ela.
-- Rodar uma vez: mysql -u root -p trocaticket < src/backend/database/migracoes/001_categoria_eventos.sql

ALTER TABLE eventos
  ADD COLUMN categoria VARCHAR(40) NULL AFTER descricao;

-- Categorias dos eventos de exemplo do seed.sql (não afeta eventos criados por você).
UPDATE eventos SET categoria = 'Festival & Show' WHERE id = 1 AND nome = 'Festival Gastronômico SP';
UPDATE eventos SET categoria = 'Corporativo'     WHERE id = 2 AND nome = 'Congresso Tech Brasil';
UPDATE eventos SET categoria = 'Formatura'       WHERE id = 3 AND nome = 'Formatura Engenharia FECAP 2026';
