-- TrocaTicket — dados de exemplo
-- Rodar logo depois do schema.sql, com o banco vazio:
--   mysql -u root -p < src/backend/database/seed.sql
--
-- Senhas (guardadas só como hash bcrypt, custo 10):
--   admin@trocaticket.com  → admin123
--   todos os outros         → senha123

USE trocaticket;

-- ── Usuários ───────────────────────────────────────────────────────────────
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, status, motivo_rejeicao) VALUES
  (1, 'Administrador',            'admin@trocaticket.com',       '$2a$10$/kiEZimU49vAeOWKaJqXIOmHDjFzUmMkZUvFQN.yt6ablSHDA/ixy', 'admin',       'aprovado',  NULL),
  (2, 'Mariana Costa',            'mariana@eventosmc.com.br',    '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'organizador', 'aprovado',  NULL),
  (3, 'Rafael Lima',              'rafael@lima-producoes.com',   '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'organizador', 'pendente',  NULL),
  (4, 'Sabores do Brasil Buffet', 'contato@saboresdobrasil.com', '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'fornecedor',  'aprovado',  NULL),
  (5, 'SomLuz Produções',         'orcamento@somluz.com.br',     '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'fornecedor',  'aprovado',  NULL),
  (6, 'Click Foto & Filme',       'click@fotofilme.com',         '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'fornecedor',  'pendente',  NULL),
  (7, 'Segura Tudo Ltda',         'comercial@seguratudo.com',    '$2a$10$K46psQQuErDCZoAeRhbLp.Y5la.5jUhPIgZvJAv1Ylet9hTUt9H9i', 'fornecedor',  'rejeitado', 'CNPJ informado não confere com a razão social.');

-- ── Eventos (todos da organizadora Mariana) ────────────────────────────────
INSERT INTO eventos (id, organizador_id, nome, descricao, categoria, data_inicio, data_fim, local, publico_minimo, publico_maximo, margem_lucro, status) VALUES
  (1, 2, 'Festival Gastronômico SP',
      'Festival ao ar livre com chefs convidados, food trucks e shows.', 'Festival & Show',
      '2026-12-12 11:00:00', '2026-12-13 22:00:00', 'Parque Ibirapuera, São Paulo - SP', 300, 500, 0.25, 'em_andamento'),
  (2, 2, 'Congresso Tech Brasil',
      'Dois dias de palestras e workshops sobre tecnologia e inovação.', 'Corporativo',
      '2027-03-20 08:00:00', '2027-03-21 18:00:00', 'Expo Center Norte, São Paulo - SP', 800, 1200, 0.30, 'aguardando_data'),
  (3, 2, 'Formatura Engenharia FECAP 2026',
      NULL, 'Formatura',
      '2027-01-30 20:00:00', '2027-01-31 04:00:00', 'Espaço Villa Noir, São Paulo - SP', 150, 250, 0.15, 'rascunho');

-- ── Itens de custo ─────────────────────────────────────────────────────────
INSERT INTO itens_custo (id, evento_id, descricao, categoria, tipo, quantidade, unidade, valor_estimado) VALUES
  -- Festival Gastronômico
  (1, 1, 'Buffet principal',            'Buffet & Gastronomia',   'fornecedor',  200, 'pessoas',     45000.00),
  (2, 1, 'Sonorização e iluminação',    'Sonorização & Luz',      'fornecedor',    1, 'pacote',      28000.00),
  (3, 1, 'Foto e filmagem',             'Foto & Filmagem',        'fornecedor',    1, 'pacote',      12000.00),
  (4, 1, 'Segurança patrimonial',       'Segurança & Apoio',      'operacional',   8, 'pessoas/dia',  8500.00),
  (5, 1, 'ISS sobre ingressos',         'Impostos & Taxas',       'fiscal',        1, 'unidade',      6200.00),
  (6, 1, 'Copos e descartáveis',        'Buffet & Gastronomia',   'variavel',    500, 'kits',         1750.00),
  -- Congresso Tech
  (7, 2, 'Coffee break (2 dias)',       'Buffet & Gastronomia',   'fornecedor', 1200, 'pessoas',     36000.00),
  (8, 2, 'Som e telões dos auditórios', 'Sonorização & Luz',      'fornecedor',    3, 'auditórios',  54000.00),
  (9, 2, 'Transporte dos palestrantes', 'Transporte & Logística', 'operacional',  10, 'diárias',      4500.00);

-- ── Propostas dos fornecedores ─────────────────────────────────────────────
INSERT INTO propostas (id, item_id, fornecedor_id, valor, descricao, validade, observacoes, status) VALUES
  (1, 1, 4, 43800.00, 'Buffet completo com entrada, 3 pratos quentes e sobremesa para 200 pessoas.', '2026-11-30', 'Inclui garçons e louça.', 'selecionada'),
  (2, 2, 5, 26500.00, 'Palco 8x6 m, PA line array, mesa digital e iluminação cênica.',              '2026-11-30', NULL,                       'selecionada'),
  (3, 2, 4, 31000.00, 'Pacote de som terceirizado com parceiro.',                                    '2026-11-20', 'Sem iluminação cênica.',   'recusada'),
  (4, 7, 4, 34500.00, 'Coffee break manhã e tarde nos dois dias.',                                   '2027-01-15', 'Opções veganas inclusas.', 'em_analise'),
  (5, 8, 5, 51900.00, 'Sonorização e 3 telões de LED 4x3 m com operador.',                           '2027-01-15', NULL,                       'em_analise');
