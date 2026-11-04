import api from "./api";

// Fornecedor: eventos abertos para cotação e propostas, pela API.

// Eventos publicados (status em_andamento), os únicos que recebem propostas.
// Cada evento traz organizador_nome e categorias_itens (o que ele precisa contratar).
export function listarEventos() {
  return api.get("/eventos?status=em_andamento");
}

// Evento com os itens de custo, para o formulário de proposta.
export async function buscarEvento(id) {
  const [evento, itens] = await Promise.all([api.get(`/eventos/${id}`), api.get(`/eventos/${id}/itens`)]);
  return { ...evento, itens };
}

// Propostas do fornecedor logado (uma por item), com evento e item de cada uma.
export function listarPropostas() {
  return api.get("/propostas/minhas");
}

// `itens`: [{ item_id, valor }] — valor total ofertado para o item (preço unitário × quantidade).
// `validade`: "AAAA-MM-DD".
export function enviarProposta(eventoId, { itens, descricao, validade, observacoes }) {
  return api.post(`/eventos/${eventoId}/propostas`, { itens, descricao: descricao.trim(), validade, observacoes: observacoes?.trim() || undefined });
}
