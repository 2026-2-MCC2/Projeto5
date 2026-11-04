import api, { salvarToken, lerToken } from "./api";

// Login, cadastro e aprovações de usuários, tudo pela API.
// O token fica salvo pelo api.js; aqui guardamos também os dados do usuário
// para a tela já abrir logada ao recarregar (o token continua sendo conferido pela API).
const SESSION_KEY = "user";

function salvarSessao(usuario) {
  try {
    if (usuario) localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // sem acesso ao armazenamento: a sessão vale só até recarregar
  }
}

// "2026-10-31 12:17:13" (MySQL) -> timestamp, usado por tempoDesde()
export const paraTimestamp = (datetime) => (datetime ? new Date(datetime.replace(" ", "T")).getTime() : undefined);

export async function registrar({ nome, email, senha, perfil }) {
  return api.post("/auth/registrar", { nome, email, senha, perfil });
}

export async function entrar(email, senha) {
  const { token, usuario } = await api.post("/auth/login", { email, senha });
  salvarToken(token);
  salvarSessao(usuario);
  return usuario;
}

// Redefinição de senha: o pedido vai para o admin, que gera o código usado em redefinirSenha.
export function solicitarRedefinicao(email) {
  return api.post("/auth/esqueci-senha", { email });
}

export function redefinirSenha({ email, codigo, senha }) {
  return api.post("/auth/redefinir-senha", { email, codigo, senha });
}

export function sair() {
  salvarToken(null);
  salvarSessao(null);
}

// Usuário salvo da última sessão. Sem token, a sessão não vale.
export function usuarioLogado() {
  if (!lerToken()) return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// Confere o token na API e devolve o usuário atualizado.
export async function conferirSessao() {
  const usuario = await api.get("/auth/eu");
  salvarSessao(usuario);
  return usuario;
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function listarPendentes() {
  const usuarios = await api.get("/admin/pendentes");
  return usuarios.map((u) => ({ ...u, criadoEm: paraTimestamp(u.criado_em) }));
}

export function aprovarUsuario(id) {
  return api.patch(`/admin/usuarios/${id}/aprovar`);
}

// O motivo aparece para o usuário quando ele tentar entrar.
export function rejeitarUsuario(id, motivo) {
  return api.patch(`/admin/usuarios/${id}/rejeitar`, { motivo });
}
