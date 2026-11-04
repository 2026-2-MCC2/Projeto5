-- Migração 002 — pedidos de redefinição de senha.
-- Só para bancos criados antes desta tabela existir; o schema.sql já vem com ela.
-- Rodar com: npm run db:migrar -- 002_redefinicoes_senha.sql
-- Pode rodar mais de uma vez: se a tabela já existir, nada muda.

CREATE TABLE IF NOT EXISTS redefinicoes_senha (
  id                INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  usuario_id        INT UNSIGNED      NOT NULL,
  codigo_hash       CHAR(60)          NULL,               -- hash bcrypt: o código nunca fica em texto puro
  codigo_expira_em  DATETIME          NULL,
  tentativas        TINYINT UNSIGNED  NOT NULL DEFAULT 0, -- códigos errados informados
  gerado_por        INT UNSIGNED      NULL,               -- admin que gerou o código
  solicitado_em     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gerado_em         DATETIME          NULL,
  usado_em          DATETIME          NULL,

  CONSTRAINT pk_redefinicoes_senha PRIMARY KEY (id),
  CONSTRAINT fk_redefinicoes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_redefinicoes_admin FOREIGN KEY (gerado_por)
    REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_redefinicoes_usado (usado_em)
) ENGINE = InnoDB;
