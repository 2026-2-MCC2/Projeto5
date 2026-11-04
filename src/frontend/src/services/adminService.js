import api from "./api";
import { paraTimestamp } from "./authService";
import { ROTULO_STATUS_EVENTO } from "../data/statusEvento";

// Dados do Dashboard do admin, pela API. As aprovações de cadastro ficam em authService.js.

// API -> tela
const doEventoApi = (e) => ({
  id: e.id,
  nome: e.nome,
  organizador: e.organizador_nome,
  data: e.data_inicio,
  local: e.local,
  categoria: e.categoria,
  status: ROTULO_STATUS_EVENTO[e.status] ?? e.status,
  orcamento: e.orcamento,
  totalPropostas: e.total_propostas,
  criadoEm: paraTimestamp(e.criado_em),
});

// Todos os eventos da plataforma.
export async function listarEventos() {
  const eventos = await api.get("/eventos");
  return eventos.map(doEventoApi);
}

// Organizadores e fornecedores: id, nome, email, perfil, status e criadoEm.
export async function listarUsuarios() {
  const usuarios = await api.get("/admin/usuarios");
  return usuarios.map((u) => ({ ...u, criadoEm: paraTimestamp(u.criado_em) }));
}
