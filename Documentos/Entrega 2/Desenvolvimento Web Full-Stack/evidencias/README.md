# Evidências — Entrega 2 (Desenvolvimento Web Full-Stack)

Prints que comprovam o CRUD de eventos integrado (front → API → MySQL) e o tratamento de erros.

## Antes de começar

1. Suba a API (`cd src/backend` → `npm run dev`) e o front (`cd src/frontend` → `npm run dev`). O passo a passo está no [README principal](../../../../README.md#-configuração-para-desenvolvimento).
2. Para começar com os dados de exemplo, rode `npm run db:recriar` em `src/backend`.
3. Entre como a organizadora **mariana@eventosmc.com.br** / **senha123**.

---

## 0. Login

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `00-login.png` | Tela de login preenchida com a organizadora, logo antes de clicar em **Entrar** |
| ☐ | `00-login-postman.png` | Postman: `POST /api/auth/login` com `200 OK` e o `token` na resposta |

## 1. Create — criar evento

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `01-create-formulario.png` | **Criar Evento**, etapa *Informações Básicas* preenchida: nome, início e término, local, público mínimo e máximo, margem de lucro e categoria |
| ☐ | `01-create-itens.png` | Etapa *Composição de Custos* com 2 ou 3 itens preenchidos |
| ☐ | `01-create-sucesso.png` | Tela de detalhes logo depois de publicar, com a mensagem verde **"Evento publicado com sucesso!"** |
| ☐ | `01-create-banco.png` | Workbench: `SELECT * FROM trocaticket.eventos;` mostrando a linha nova |
| ☐ | `01-create-postman.png` | Postman: `POST /api/eventos` com `201 Created` e o evento criado na resposta |

## 2. Read — listar e ver detalhes

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `02-list-eventos.png` | **Meus Eventos** com a lista carregada da API, incluindo o evento criado |
| ☐ | `02-list-detalhes.png` | Tela de **Detalhes** do evento: itens de custo, informações (datas, público, margem) e propostas |
| ☐ | `02-list-postman.png` | Postman: `GET /api/eventos` com `200 OK` e a lista em JSON |

## 3. Update — editar evento

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `03-update-antes.png` | Detalhes do evento **antes** da edição (ex.: nome e margem originais) |
| ☐ | `03-update-formulario.png` | Tela **Editar Evento** com os campos alterados (ex.: novo nome e nova margem) |
| ☐ | `03-update-sucesso.png` | Detalhes **depois** de salvar, com a mensagem **"Alterações salvas com sucesso."** e os dados novos |
| ☐ | `03-update-itens.png` | (opcional) **Editar Itens** salvo, com a mensagem **"Itens do evento salvos com sucesso."** |
| ☐ | `03-update-postman.png` | Postman: `PUT /api/eventos/:id` com `200 OK` e os dados alterados |

## 4. Delete — excluir evento

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `04-delete-confirmacao.png` | Modal **"Excluir evento?"** aberto, antes de confirmar |
| ☐ | `04-delete-sucesso.png` | **Meus Eventos** depois de excluir, com a mensagem **"O evento ... foi excluído."** e o evento fora da lista |
| ☐ | `04-delete-postman.png` | Postman: `DELETE /api/eventos/:id` com `204 No Content` |
| ☐ | `04-delete-banco.png` | (opcional) Workbench: `SELECT` mostrando que a linha não existe mais |

## 5. Erros

| ✔ | Arquivo | O que mostrar | Como provocar |
|---|---|---|---|
| ☐ | `05-erro-400-campos.png` | Postman: `POST /api/eventos` com corpo `{}` → `400 Bad Request` e a lista de campos obrigatórios | Pasta *Erros esperados* da coleção do Postman |
| ☐ | `05-erro-400-validacao.png` | Postman: público mínimo maior que o máximo e margem `1.5` → `400` com a mensagem explicando | Pasta *Erros esperados* |
| ☐ | `05-erro-validacao-front.png` | Formulário do front com público mínimo maior que o máximo e o botão de avançar desativado | Digite mínimo `500` e máximo `100` |
| ☐ | `05-erro-404-api.png` | Postman: `GET /api/eventos/999999` → `404 Not Found` com `{ "erro": "Evento não encontrado." }` | Pasta *Erros esperados* |
| ☐ | `05-erro-404-front.png` | Tela **"Evento não encontrado"** do front | Abra `http://localhost:5173/organizador/eventos/9999` |
| ☐ | `05-erro-404-pagina.png` | Tela **"Página não encontrada"** | Abra `http://localhost:5173/qualquer-coisa` |
| ☐ | `05-erro-401-token.png` | Postman: `GET /api/eventos` sem token → `401 Unauthorized` | Pasta *Erros esperados* |
| ☐ | `05-erro-login-senha.png` | Login com senha errada → **"E-mail ou senha incorretos."** | Qualquer e-mail com senha errada |
| ☐ | `05-erro-login-pendente.png` | Login de usuário pendente → **"Seu cadastro ainda está aguardando a aprovação do administrador."** | `rafael@lima-producoes.com` / `senha123` |
| ☐ | `05-erro-login-rejeitado.png` | Login de usuário rejeitado → mensagem com o **motivo da rejeição** | `comercial@seguratudo.com` / `senha123` |
| ☐ | `05-erro-servidor.png` | Front com a API desligada → **"Não foi possível conectar ao servidor..."** e o botão **Tentar de novo** | Pare a API (Ctrl+C) e recarregue **Meus Eventos** |

> Os logins pendente e rejeitado só funcionam se ninguém tiver aprovado essas contas antes. Na dúvida, rode `npm run db:recriar`.

## 6. (Opcional) Admin

| ✔ | Arquivo | O que mostrar |
|---|---|---|
| ☐ | `06-admin-pendentes.png` | Admin (`admin@trocaticket.com` / `admin123`) em **Aprovações**, com os cadastros pendentes |
| ☐ | `06-admin-rejeitar.png` | Modal de rejeição com o motivo preenchido |
| ☐ | `06-admin-sucesso.png` | Mensagem de sucesso depois de aprovar ou rejeitar |
| ☐ | `06-postman-runner.png` | Postman: **Run collection** com todos os testes passando |
