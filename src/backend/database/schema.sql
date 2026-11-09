-- TrocaTicket — esquema do banco de dados (MySQL 8.0.16+, necessário para os CHECKs)
-- Rodar com: mysql -u root -p < src/backend/database/schema.sql

CREATE DATABASE IF NOT EXISTS trocaticket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trocaticket;

-- ── Usuários (admin, organizador, fornecedor) ──────────────────────────────
CREATE TABLE usuarios (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome             VARCHAR(120)  NOT NULL,
  email            VARCHAR(160)  NOT NULL,
  cnpj             CHAR(14)      NULL,               -- só os 14 dígitos; fornecedor sempre tem, organizador tem CNPJ ou CPF (admin fica NULL)
  cpf              CHAR(11)      NULL,               -- só os 11 dígitos; opção do organizador pessoa física
  senha_hash     CHAR(60)      NOT NULL,           -- hash bcrypt (sempre 60 caracteres)
  perfil           ENUM('admin', 'organizador', 'fornecedor') NOT NULL,
  status           ENUM('pendente', 'aprovado', 'rejeitado')  NOT NULL DEFAULT 'pendente',
  motivo_rejeicao  VARCHAR(500)  NULL,
  criado_em        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_usuarios PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT uq_usuarios_cnpj UNIQUE (cnpj),
  CONSTRAINT ck_usuarios_cnpj CHECK (cnpj IS NULL OR cnpj REGEXP '^[0-9]{14}$'),
  CONSTRAINT uq_usuarios_cpf UNIQUE (cpf),
  CONSTRAINT ck_usuarios_cpf CHECK (cpf IS NULL OR cpf REGEXP '^[0-9]{11}$'),
  CONSTRAINT ck_usuarios_um_documento CHECK (cnpj IS NULL OR cpf IS NULL), -- nunca os dois ao mesmo tempo
  CONSTRAINT ck_usuarios_nome CHECK (CHAR_LENGTH(TRIM(nome)) > 0),
  -- só usuários rejeitados têm motivo de rejeição, e ele é obrigatório nesse caso
  CONSTRAINT ck_usuarios_motivo CHECK (
    (status = 'rejeitado' AND motivo_rejeicao IS NOT NULL AND CHAR_LENGTH(TRIM(motivo_rejeicao)) > 0)
    OR (status <> 'rejeitado' AND motivo_rejeicao IS NULL)
  )
) ENGINE = InnoDB;

-- ── Eventos criados pelos organizadores ────────────────────────────────────
CREATE TABLE eventos (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  organizador_id  INT UNSIGNED   NOT NULL,
  nome            VARCHAR(150)   NOT NULL,
  descricao       TEXT           NULL,
  categoria       VARCHAR(40)    NULL,  -- ex.: 'Corporativo' (lista em front/src/data/categorias.js)
  data_inicio     DATETIME       NOT NULL,
  data_fim        DATETIME       NOT NULL,
  local           VARCHAR(200)   NOT NULL,
  publico_minimo  INT UNSIGNED   NOT NULL,
  publico_maximo  INT UNSIGNED   NOT NULL,
  margem_lucro    DECIMAL(4, 2)  NOT NULL DEFAULT 0.00,  -- fração: 0.25 = 25%
  status          ENUM('rascunho', 'aguardando_data', 'em_andamento', 'concluido', 'cancelado')
                                 NOT NULL DEFAULT 'rascunho',
  criado_em       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_eventos PRIMARY KEY (id),
  CONSTRAINT fk_eventos_organizador FOREIGN KEY (organizador_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_eventos_nome    CHECK (CHAR_LENGTH(TRIM(nome)) > 0),
  CONSTRAINT ck_eventos_datas   CHECK (data_fim >= data_inicio),
  CONSTRAINT ck_eventos_publico CHECK (publico_minimo > 0 AND publico_maximo >= publico_minimo),
  CONSTRAINT ck_eventos_margem  CHECK (margem_lucro >= 0 AND margem_lucro <= 0.99)
) ENGINE = InnoDB;

CREATE INDEX idx_eventos_organizador ON eventos (organizador_id);
CREATE INDEX idx_eventos_status      ON eventos (status);

-- ── Itens de custo de cada evento ──────────────────────────────────────────
CREATE TABLE itens_custo (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  evento_id       INT UNSIGNED    NOT NULL,
  descricao       VARCHAR(200)    NOT NULL,
  categoria       VARCHAR(80)     NOT NULL,  -- ex.: 'Buffet & Gastronomia' (lista em front/src/data/categorias.js)
  tipo            ENUM('fornecedor', 'fiscal', 'operacional', 'variavel') NOT NULL,
  quantidade      DECIMAL(10, 2)  NOT NULL DEFAULT 1,
  unidade         VARCHAR(30)     NOT NULL DEFAULT 'unidade',
  valor_estimado  DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,

  CONSTRAINT pk_itens_custo PRIMARY KEY (id),
  CONSTRAINT fk_itens_custo_evento FOREIGN KEY (evento_id)
    REFERENCES eventos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ck_itens_custo_descricao  CHECK (CHAR_LENGTH(TRIM(descricao)) > 0),
  CONSTRAINT ck_itens_custo_quantidade CHECK (quantidade > 0),
  CONSTRAINT ck_itens_custo_valor      CHECK (valor_estimado >= 0)
) ENGINE = InnoDB;

CREATE INDEX idx_itens_custo_evento ON itens_custo (evento_id);

-- ── Propostas dos fornecedores para os itens ───────────────────────────────
CREATE TABLE propostas (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  item_id        INT UNSIGNED    NOT NULL,
  fornecedor_id  INT UNSIGNED    NOT NULL,
  valor          DECIMAL(12, 2)  NOT NULL,
  descricao      TEXT            NOT NULL,
  validade       DATE            NOT NULL,
  observacoes    TEXT            NULL,
  status         ENUM('em_analise', 'selecionada', 'recusada') NOT NULL DEFAULT 'em_analise',
  criado_em      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_propostas PRIMARY KEY (id),
  CONSTRAINT fk_propostas_item FOREIGN KEY (item_id)
    REFERENCES itens_custo (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_propostas_fornecedor FOREIGN KEY (fornecedor_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  -- um fornecedor envia no máximo uma proposta por item
  CONSTRAINT uq_propostas_item_fornecedor UNIQUE (item_id, fornecedor_id),
  CONSTRAINT ck_propostas_valor CHECK (valor > 0)
) ENGINE = InnoDB;

CREATE INDEX idx_propostas_fornecedor ON propostas (fornecedor_id);
CREATE INDEX idx_propostas_status     ON propostas (status);

-- ── Pedidos de redefinição de senha ────────────────────────────────────────
-- O usuário pede, o admin gera um código e o usuário o usa para criar a senha nova.
-- Mesma tabela da migração 002: mantenha as duas iguais.
CREATE TABLE redefinicoes_senha (
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
