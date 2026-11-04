# FECAP - Fundação de Comércio Álvares Penteado


<p align="center">
<a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# TrocaTicket

## Grupo Nexus

## Integrantes: 
<a href="https://www.linkedin.com/in/victorbarq/">Enzo Augusto Pedroza Gonçalves</a>

<a href="https://www.linkedin.com/in/victorbarq/">Felipe Câmara Noguchi</a>

<a href="https://www.linkedin.com/in/leonardo-fran%C3%A7a-68bb97349/">Leonardo Batista França</a>

<a href="https://www.linkedin.com/in/victorbarq/">Stefany Anne Apaza de Freitas</a>

## Professores Orientadores: 
<a href="https://www.linkedin.com/in/dolemes/">David de Oliveira Lemes</a>

<a href="https://www.linkedin.com/in/francisco-escobar/">Francisco de Souza Escobar</a>

<a href="https://www.linkedin.com/in/katia-bossi/">Kátia Bossi</a>

<a href="https://www.linkedin.com/in/cristina-machado-corr%C3%AAa-leite-630309160/">Cristina Machado Corrêa Leite </a>

<a href="https://www.linkedin.com/in/jesuslisboagomes/">Jésus Gomes</a>

## Descrição

<p align="center">
  <img src="./imagens/troca_ticket.jpg" alt="Troca Ticket">
</p>
  Game by <a href="http://www.nyphotographic.com/">Nick Youngson</a> <a rel="license" href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a> <a href="http://pix4free.org/">Pix4free</a>
</p>


O TrocaTicket é uma plataforma voltada para o planejamento e organização de eventos, conectando organizadores e fornecedores em um mesmo ambiente. A plataforma permite que organizadores criem seus eventos, cadastrem os custos necessários e publiquem os itens para cotação.

Os fornecedores aprovados podem visualizar os eventos disponíveis e enviar propostas para os itens de custo. A partir das propostas recebidas, o organizador pode comparar as opções, selecionar as propostas e consolidar os custos do evento. Com essas informações, a plataforma também permite calcular o ticket estimado de acordo com o custo total, público e margem de lucro.
<br><br>

## 🌐 Aplicação publicada

| | Endereço | Hospedagem |
|---|---|---|
| **Site** | <https://projeto5-flame.vercel.app> | Vercel |
| **API** | <https://projeto5-production.up.railway.app/api> | Railway |
| **Banco de dados** | MySQL acessado só pela API | Railway |

Para conferir se a API está no ar, abra <https://projeto5-production.up.railway.app/api/saude>. As contas de teste estão em [Credenciais de teste](#credenciais-de-teste).

## 🎟️ Cálculo do ticket

O ticket estimado usa o custo consolidado do evento, o público e a margem de lucro definida pelo organizador. Cada evento tem um único tipo de ingresso.

**Custo consolidado:** soma de todos os itens do evento, usando o valor acordado quando há proposta selecionada e o valor estimado nos demais.

**Fórmulas**, com a margem definida sobre a receita (preço de venda):

```
Ticket de equilíbrio = Custo consolidado ÷ Público
Ticket-alvo          = Custo consolidado ÷ [Público × (1 − Margem)]
```

Na tela, o ticket de equilíbrio aparece como **Custo por pessoa** e o ticket-alvo como o preço **por ingresso**.

**Exemplo** (Festival Gastronômico do seed, com custo consolidado de R$ 98.750 e margem de 25%):

| Cenário | Público | Ticket de equilíbrio | Ticket-alvo |
|---|---|---|---|
| Público mínimo | 300 | R$ 329,17 | R$ 438,89 |
| Público máximo | 500 | R$ 197,50 | R$ 263,33 |

**Hipóteses adotadas:**

- O custo consolidado é o mesmo nos dois cenários de público: nenhum custo varia com a quantidade de pessoas.
- Custos fiscais, operacionais e variáveis são informados pelo organizador como valor estimado e não recebem propostas de fornecedores.
- Impostos, como o ISS, são valores fixos informados pelo organizador e não são recalculados a partir da receita.
- Um item de fornecedor sem proposta selecionada entra no custo pelo valor estimado.
- Todos os ingressos do cenário são vendidos: a receita prevista é igual nos dois cenários, porque o preço se ajusta ao público.

**Validações:** o custo e o público precisam ser maiores que zero, e a margem fica entre 0 e 99%, para o divisor nunca ser zero. Sem custos cadastrados, o ticket não é calculado.

**Arredondamento:** o cálculo usa a precisão completa, e o valor é arredondado para 2 casas decimais só na exibição.

## 🛠 Estrutura de pastas

```
Projeto5/
├── Documentos/                          # Entregas do PI, separadas por entrega e disciplina
│   ├── Entrega 1/
│   │   ├── Cálculo II/
│   │   ├── Desenvolvimento Web Full-Stack/
│   │   ├── Gestão Empresarial e Dinâmica das Organizações/
│   │   ├── Projeto em Banco de Dados/
│   │   └── Projeto Interdisciplinar/
│   └── Entrega 2/                       # Mesmas disciplinas da Entrega 1
│       └── Desenvolvimento Web Full-Stack/
│           └── evidencias/              # Prints do CRUD e dos erros
├── imagens/                             # Imagens e logotipos do TrocaTicket
├── src/
│   ├── backend/                         # API em Node.js + Express + MySQL
│   │   ├── database/                    # schema.sql, seed.sql e migrações
│   │   ├── postman/                     # Coleção do Postman
│   │   └── src/                         # config, routes, controllers, services, middlewares
│   └── frontend/                        # Front-end em React + Vite
│       ├── public/
│       └── src/
│           ├── assets/
│           ├── components/
│           ├── context/
│           ├── pages/
│           └── services/                # api.js e chamadas à API
└── README.md
```

<b>Documentos</b>: toda a documentação das entregas, organizada por disciplina.

<b>imagens</b>: imagens do sistema.

<b>src</b>: código-fonte do projeto. Detalhes da API em [`src/backend/README.md`](src/backend/README.md).

<b>Banco de dados</b>: diagrama, tabelas, campos, tipos e relacionamentos em [`src/backend/database/README.md`](src/backend/database/README.md).

## 💻 Configuração para Desenvolvimento

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou mais novo
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) 8.0.16 ou mais novo, rodando na máquina
- Opcional: [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) e [Postman](https://www.postman.com/downloads/)

### 1. Back-end (API)

```sh
cd src/backend
npm install
cp .env.example .env     # depois abra o .env e preencha DB_PASSWORD e JWT_SECRET
npm run db:criar         # cria o banco: roda database/schema.sql e database/seed.sql
npm run dev              # API em http://localhost:3001/api
```

- No `.env`, coloque a senha do seu MySQL em `DB_PASSWORD` e um segredo aleatório em `JWT_SECRET`, que pode ser gerado com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Para criar o banco sem o script, execute no MySQL (terminal ou Workbench) primeiro o `src/backend/database/schema.sql` e depois o `src/backend/database/seed.sql`.
- `npm run db:recriar` apaga o banco e cria de novo com os dados de exemplo.

### 2. Front-end

Em **outro terminal**, com a API rodando:

```sh
cd src/frontend
npm install
cp .env.example .env     # opcional: só se a API não estiver em http://localhost:3001/api
npm run dev              # abre em http://localhost:5173
```

O `.env` do front tem uma variável, `VITE_API_URL`, com o endereço da API. Sem ele, o front usa `http://localhost:3001/api`.

Outros comandos disponíveis em `src/frontend`:

```sh
npm run build    # gera a versão de produção em dist/
npm run lint     # verifica o código com o oxlint
```

### Credenciais de teste

Criadas pelo `seed.sql`:

| Perfil | E-mail | Senha |
|---|---|---|
| **Admin** | `admin@trocaticket.com` | `admin123` |
| Organizador | `mariana@eventosmc.com.br` | `senha1234` |
| Fornecedor | `contato@saboresdobrasil.com` | `senha123` |

A lista completa, com usuários pendentes e rejeitados para testar os bloqueios de login, está em [`src/backend/README.md`](src/backend/README.md#credenciais-de-teste).

### Endpoints da API

Base local: `http://localhost:3001/api`. Base publicada: `https://projeto5-production.up.railway.app/api`. As rotas marcadas com 🔒 exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/saude` | Confere se a API está no ar |
| POST | `/auth/registrar` | Cadastro de organizador ou fornecedor (fica pendente) |
| POST | `/auth/login` | Login; devolve o token JWT |
| POST | `/auth/esqueci-senha` | Pedir a redefinição de senha |
| POST | `/auth/redefinir-senha` | Trocar a senha com o código do admin |
| GET | `/auth/eu` 🔒 | Usuário logado |
| GET | `/admin/pendentes` 🔒 | Cadastros pendentes (admin) |
| GET | `/admin/usuarios` 🔒 | Organizadores e fornecedores (admin) |
| PATCH | `/admin/usuarios/:id/aprovar` 🔒 | Aprovar cadastro (admin) |
| PATCH | `/admin/usuarios/:id/rejeitar` 🔒 | Rejeitar cadastro com motivo (admin) |
| GET | `/admin/redefinicoes` 🔒 | Pedidos de redefinição de senha (admin) |
| POST | `/admin/redefinicoes/:id/codigo` 🔒 | Gerar código de redefinição (admin) |
| GET | `/eventos` 🔒 | Listar eventos |
| GET | `/eventos/:id` 🔒 | Ver um evento |
| POST | `/eventos` 🔒 | Criar evento (organizador) |
| PUT | `/eventos/:id` 🔒 | Editar evento (organizador dono) |
| DELETE | `/eventos/:id` 🔒 | Excluir evento (organizador dono) |
| GET | `/eventos/:id/itens` 🔒 | Itens de custo do evento |
| PUT | `/eventos/:id/itens` 🔒 | Salvar itens de custo (organizador dono) |
| POST | `/eventos/:id/propostas` 🔒 | Enviar proposta para itens do evento (fornecedor) |
| GET | `/eventos/:id/propostas` 🔒 | Propostas recebidas pelo evento (organizador dono) |
| PUT | `/eventos/:id/selecao` 🔒 | Selecionar propostas (organizador dono) |
| POST | `/eventos/:id/finalizar` 🔒 | Fechar a composição de custos (organizador dono) |
| GET | `/propostas/minhas` 🔒 | Propostas do fornecedor logado |

Os campos de cada rota e os códigos de erro (400, 401, 403, 404, 409, 500) estão em [`src/backend/README.md`](src/backend/README.md#endpoints). Para testar no Postman, importe `src/backend/postman/TrocaTicket.postman_collection.json`. A coleção aponta para a API publicada; para testar localmente, troque a variável `baseUrl` por `http://localhost:3001/api`.

## 📋 Licença/License
Utilize o link <https://chooser-beta.creativecommons.org/> para fazer uma licença CC BY 4.0.

## 🎓 Referências

Aqui estão as referências usadas no projeto.

1. <https://github.com/iuricode/readme-template>
2. <https://github.com/gabrieldejesus/readme-model>
3. <https://chooser-beta.creativecommons.org/>
4. <https://freesound.org/>
5. <https://www.toptal.com/developers/gitignore>
6. Músicas por: <a href="https://freesound.org/people/DaveJf/sounds/616544/"> DaveJf </a> e <a href="https://freesound.org/people/DRFX/sounds/338986/"> DRFX </a> ambas com Licença CC 0.
