import api from "./api";

// Eventos e itens de custo do organizador, pela API.
// As telas trabalham com os nomes do banco (data_inicio, publico_minimo...), exceto nos itens,
// que usam `estimado`/`acordado` como o EditorItens sempre usou.

let proximoIdLocal = -1;

// Item ainda não salvo: id negativo só para o React (key) e para o EditorItens achar a linha.
export function novoItem(categoria) {
  return { id: proximoIdLocal--, descricao: "", quantidade: 1, unidade: "unidade", categoria, tipo: "fornecedor", estimado: 0, acordado: null };
}

export const somaEstimado = (itens) => itens.reduce((soma, i) => soma + i.estimado, 0);

// Custo usado no ticket: valor acordado onde há proposta escolhida e o estimado no resto
// (itens ainda sem proposta e custos fiscais, operacionais e variáveis).
export const custoConsolidado = (itens) => itens.reduce((soma, i) => soma + (i.acordado ?? i.estimado), 0);

// API -> tela
const doItemApi = (i) => ({
  id: i.id,
  descricao: i.descricao,
  quantidade: i.quantidade,
  unidade: i.unidade,
  categoria: i.categoria,
  tipo: i.tipo,
  estimado: i.valor_estimado,
  acordado: i.valor_acordado, // valor da proposta selecionada, ou null
  totalPropostas: i.total_propostas,
});

// tela -> API. Itens novos (id negativo) vão sem id para a API criar.
// Linhas deixadas em branco são ignoradas.
const paraItensApi = (itens) =>
  itens
    .filter((i) => i.descricao.trim())
    .map((i) => ({
      ...(i.id > 0 ? { id: i.id } : {}),
      descricao: i.descricao.trim(),
      categoria: i.categoria,
      tipo: i.tipo || "fornecedor",
      quantidade: i.quantidade || 1,
      unidade: i.unidade.trim() || "unidade",
      valor_estimado: i.estimado || 0,
    }));

export function listarEventos(organizadorId) {
  return api.get(`/eventos?organizador_id=${organizadorId}`);
}

// Evento com os itens de custo já carregados.
export async function buscarEvento(id) {
  const [evento, itens] = await Promise.all([api.get(`/eventos/${id}`), api.get(`/eventos/${id}/itens`)]);
  return { ...evento, itens: itens.map(doItemApi) };
}

// `dados`: nome, descricao, categoria, data_inicio, data_fim, local, publico_minimo, publico_maximo, margem_lucro, status
export function criarEvento(dados, itens = []) {
  return api.post("/eventos", { ...dados, itens: paraItensApi(itens) });
}

// PUT substitui o evento inteiro: mande todos os campos, não só os alterados.
export function atualizarEvento(id, dados) {
  return api.put(`/eventos/${id}`, dados);
}

export function excluirEvento(id) {
  return api.delete(`/eventos/${id}`);
}

export async function salvarItens(id, itens) {
  const salvos = await api.put(`/eventos/${id}/itens`, { itens: paraItensApi(itens) });
  return salvos.map(doItemApi);
}

// ── Propostas recebidas ────────────────────────────────────────────────────

// Uma proposta por item: id, item_id, item_descricao, item_categoria, quantidade, unidade, valor_estimado,
// fornecedor_nome, valor, descricao, validade, observacoes, status (em_analise | selecionada | recusada).
export function listarPropostas(eventoId) {
  return api.get(`/eventos/${eventoId}/propostas`);
}

// Define as propostas escolhidas (no máximo uma por item). Devolve a lista atualizada.
export function salvarSelecao(eventoId, idsPropostas) {
  return api.put(`/eventos/${eventoId}/selecao`, { propostas: idsPropostas });
}

// Fecha a composição: o evento vai para "aguardando_data" e as não escolhidas viram "recusada".
export function finalizarEvento(eventoId) {
  return api.post(`/eventos/${eventoId}/finalizar`);
}
