# TrocaTicket — API (back-end)

API REST do TrocaTicket em **Node.js + Express + MySQL** (driver `mysql2`), com autenticação por **JWT** e senhas guardadas com **bcrypt**.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou mais novo
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) **8.0.16 ou mais novo** (os `CHECK` do schema precisam dessa versão), rodando na máquina
- Opcional: [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) para ver as tabelas e o [Postman](https://www.postman.com/downloads/) para testar a API

## 1. Instalar as dependências

```sh
cd src/backend
npm install
```

## 2. Configurar o `.env`

Copie o modelo e preencha com os seus dados:

```sh
cp .env.example .env
```

| Variável | Para que serve | Exemplo |
|---|---|---|
| `PORT` | Porta da API | `3001` |
| `FRONT_URL` | Endereço do front liberado no CORS (vários separados por vírgula) | `http://localhost:5173` |
| `DB_HOST` / `DB_PORT` | Onde o MySQL está rodando | `localhost` / `3306` |
| `DB_USER` / `DB_PASSWORD` | Usuário e senha do **seu** MySQL | `root` / *(sua senha)* |
| `DB_NAME` | Nome do banco | `trocaticket` |
| `JWT_SECRET` | Segredo que assina os tokens de login (mínimo 32 caracteres aleatórios) | *(gere com o comando abaixo)* |
| `JWT_EXPIRA_EM` | Tempo até o login expirar | `8h` |

Para gerar um `JWT_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> O `.env` tem senhas e **não vai para o Git** (está no `.gitignore`). Só o `.env.example` é versionado.

## 3. Criar o banco de dados

O banco é criado por dois arquivos em [`database/`](database):

- [`schema.sql`](database/schema.sql): cria o banco `trocaticket` e as tabelas `usuarios`, `eventos`, `itens_custo` e `propostas`, com chaves estrangeiras e `CHECK`s;
- [`seed.sql`](database/seed.sql): insere dados de exemplo (usuários, 3 eventos, itens de custo e propostas).

**Jeito mais fácil** (usa os dados do `.env`, não precisa do `mysql` no terminal):

```sh
npm run db:criar      # roda schema.sql e seed.sql; não mexe em nada se o banco já existir
npm run db:recriar    # APAGA o banco e cria de novo do zero, com os dados de exemplo
```

**Jeito manual**, pelo terminal do MySQL (rode o schema antes do seed):

```sh
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Ou no MySQL Workbench: abra cada arquivo em **File → Open SQL Script** e execute (raio ⚡), primeiro o `schema.sql` e depois o `seed.sql`.

> **Banco criado antes de existir a coluna `categoria` em `eventos`?** Rode uma vez a migração
> [`database/migracoes/001_categoria_eventos.sql`](database/migracoes/001_categoria_eventos.sql) (ou `npm run db:recriar`, que apaga os dados).

## 4. Rodar a API

```sh
npm run dev     # desenvolvimento: reinicia sozinho ao salvar (nodemon)
npm start       # sem reinício automático
```

Ao subir, o terminal mostra `API do TrocaTicket rodando em http://localhost:3001/api`. Para conferir, abra [http://localhost:3001/api/saude](http://localhost:3001/api/saude), que deve responder `{"status":"ok"}`.

Se aparecer *"Não foi possível conectar ao MySQL"*, confira se o MySQL está ligado e se `DB_USER`/`DB_PASSWORD` no `.env` estão certos.

## Credenciais de teste

Todas vêm do `seed.sql`:

| Perfil | E-mail | Senha | Situação |
|---|---|---|---|
| **Admin** | `admin@trocaticket.com` | `admin123` | aprovado |
| Organizador | `mariana@eventosmc.com.br` | `senha123` | aprovado (dona dos 3 eventos) |
| Organizador | `rafael@lima-producoes.com` | `senha123` | pendente (não consegue entrar) |
| Fornecedor | `contato@saboresdobrasil.com` | `senha123` | aprovado |
| Fornecedor | `orcamento@somluz.com.br` | `senha123` | aprovado |
| Fornecedor | `click@fotofilme.com` | `senha123` | pendente |
| Fornecedor | `comercial@seguratudo.com` | `senha123` | rejeitado (mostra o motivo no login) |

> São contas de exemplo para desenvolvimento. Não use essas senhas em produção.

## Endpoints

Base: `http://localhost:3001/api`

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`, com o token devolvido pelo login.

### Geral

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/saude` | público | Confere se a API está no ar |

### Autenticação

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/registrar` | público | Cadastra organizador ou fornecedor com status `pendente`. Corpo: `nome`, `email`, `senha` (mín. 6), `perfil` (`organizador` ou `fornecedor`) |
| POST | `/auth/login` | público | Corpo: `email`, `senha`. Devolve `{ token, usuario }`. Bloqueia cadastros pendentes ou rejeitados (403) |
| GET | `/auth/eu` | logado | Dados de quem está logado |

### Admin

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/admin/pendentes` | admin | Cadastros aguardando aprovação |
| PATCH | `/admin/usuarios/:id/aprovar` | admin | Aprova o usuário |
| PATCH | `/admin/usuarios/:id/rejeitar` | admin | Rejeita o usuário. Corpo: `{ "motivo": "..." }` (obrigatório) |

### Eventos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/eventos` | logado | Lista eventos. Filtros opcionais: `?organizador_id=2&status=rascunho` |
| GET | `/eventos/:id` | logado | Um evento (inclui `orcamento` e `total_propostas`) |
| POST | `/eventos` | organizador | Cria evento do organizador logado. Pode incluir `itens: [...]` |
| PUT | `/eventos/:id` | organizador dono | Substitui o evento inteiro (mande todos os campos) |
| DELETE | `/eventos/:id` | organizador dono | Exclui o evento, com seus itens e propostas |
| GET | `/eventos/:id/itens` | logado | Itens de custo do evento (`valor_acordado` = proposta selecionada) |
| PUT | `/eventos/:id/itens` | organizador dono | Substitui a lista de itens: `{ "itens": [...] }` |

**Campos de um evento:** `nome`\*, `descricao`, `categoria` (`Corporativo`, `Festival & Show`, `Casamento`, `Formatura`, `Social`, `Esportivo`), `data_inicio`\* e `data_fim`\* (`AAAA-MM-DD HH:MM`), `local`\*, `publico_minimo`\* e `publico_maximo`\* (inteiros, mínimo ≤ máximo), `margem_lucro` (de 0 a 0.99; `0.25` = 25%), `status` (`rascunho`, `aguardando_data`, `em_andamento`, `concluido`, `cancelado`). \* obrigatório.

**Campos de um item:** `descricao`\*, `categoria`\*, `tipo` (`fornecedor`, `fiscal`, `operacional`, `variavel`), `quantidade` (> 0), `unidade`, `valor_estimado` (≥ 0). Para manter um item existente, mande o `id` dele; itens sem `id` são criados e os que não vierem são apagados.

### Respostas de erro

Todo erro volta em JSON no formato `{ "erro": "mensagem" }`:

| Status | Quando |
|---|---|
| 400 | Dados inválidos (campo obrigatório faltando, público mínimo > máximo, margem fora de 0–0.99, JSON mal formado...) |
| 401 | Sem token, token inválido/expirado ou e-mail/senha incorretos |
| 403 | Logado sem permissão (ex.: fornecedor criando evento, organizador editando evento de outro) ou cadastro pendente/rejeitado |
| 404 | Evento, usuário ou rota não encontrados |
| 409 | E-mail já cadastrado |
| 500 | Erro interno do servidor |

## Testando com o Postman

Importe [`postman/TrocaTicket.postman_collection.json`](postman/TrocaTicket.postman_collection.json) no Postman (**Import**). Rode primeiro **Auth → Login**: o token é salvo sozinho na variável `{{token}}` e usado nas outras requisições. A coleção tem o CRUD de eventos e testes de erro (400, 401, 404).

## Estrutura de pastas

```
src/backend/
├── database/
│   ├── schema.sql          # cria o banco e as tabelas
│   ├── seed.sql            # dados de exemplo
│   ├── setup.js            # usado por npm run db:criar / db:recriar
│   └── migracoes/          # alterações para bancos já existentes
├── postman/                # coleção do Postman
├── src/
│   ├── server.js           # sobe a API
│   ├── app.js              # Express: CORS, JSON, rotas, erros
│   ├── config/             # .env e conexão com o MySQL
│   ├── routes/             # URLs de cada recurso
│   ├── controllers/        # recebem a requisição e devolvem a resposta
│   ├── services/           # regras de negócio e SQL
│   ├── middlewares/        # autenticação, permissões e tratamento de erros
│   └── utils/              # validações, erros HTTP e transações
├── .env.example
└── package.json
```
