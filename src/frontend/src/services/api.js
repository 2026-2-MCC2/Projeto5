// Cliente HTTP da API do TrocaTicket. Todas as chamadas ao back-end passam por aqui.
// - A URL base vem do .env (VITE_API_URL).
// - O token do login é enviado sozinho no cabeçalho Authorization.
// - Qualquer erro vira um ErroApi com uma mensagem pronta para mostrar na tela.

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

const TOKEN_KEY = "token";

// Disparado quando a API diz que o token não vale mais (expirou ou foi invalidado).
// O AuthContext escuta este evento para deslogar e mandar para o login.
export const EVENTO_SESSAO_EXPIRADA = "tt:sessao-expirada";

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status; // 0 = não conseguiu falar com o servidor
  }
}

export function lerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function salvarToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sem acesso ao armazenamento (ex.: navegação privada): o login dura só até recarregar a página.
  }
}

async function requisicao(metodo, caminho, corpo) {
  const token = lerToken();
  const headers = {};
  if (corpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi("Não foi possível conectar ao servidor. Verifique sua conexão ou se a API está rodando.", 0);
  }

  // 204 No Content (ex.: DELETE) não tem corpo.
  const texto = resposta.status === 204 ? "" : await resposta.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    // resposta que não é JSON (ex.: página de erro de um proxy)
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      salvarToken(null);
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
    const padrao = resposta.status >= 500 ? "Erro no servidor. Tente novamente em instantes." : `Erro ${resposta.status} na requisição.`;
    throw new ErroApi(dados?.erro || padrao, resposta.status);
  }
  return dados;
}

const api = {
  get: (caminho) => requisicao("GET", caminho),
  post: (caminho, corpo) => requisicao("POST", caminho, corpo ?? {}),
  put: (caminho, corpo) => requisicao("PUT", caminho, corpo ?? {}),
  patch: (caminho, corpo) => requisicao("PATCH", caminho, corpo),
  delete: (caminho) => requisicao("DELETE", caminho),
};

export default api;
