import api from "./api";

// Fornecedor: eventos abertos para cotação e propostas, pela API.
// Avaliações e desempenho ainda não têm tabela no banco: continuam como dados de exemplo (tela Reputação).

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

// ── Dados de exemplo (sem API ainda) ──────────────────────────────────────

const avaliacoes = [
  { id: 1, evento: "Casamento Rodrigues & Lima", organizador: "Ana Lima", data: "2024-12-01", nota: 5, resumo: "Serviço impecável, pontual e de altíssima qualidade.", comentario: "O buffet foi simplesmente perfeito. Chegaram no horário combinado, montagem rápida e eficiente. A comida estava deliciosa e os convidados não pararam de elogiar. Superaram todas as expectativas. Com certeza contrataremos novamente!" },
  { id: 2, evento: "Festival Gastronômico SP", organizador: "Carlos Mendes", data: "2025-03-01", nota: 5, resumo: "Excelente profissionalismo e qualidade.", comentario: "Equipe muito profissional. Entregaram tudo dentro do prazo e o cardápio superou as expectativas. A logística para 500 pessoas foi impecável. Recomendo muito." },
  { id: 3, evento: "Congresso Tech Brasil", organizador: "Patrícia Souza", data: "2025-01-01", nota: 4, resumo: "Ótimo serviço, pequenos ajustes na montagem.", comentario: "O buffet foi muito bem executado. Houve um pequeno atraso na montagem inicial mas foi resolvido rapidamente. A qualidade da comida estava excelente e o atendimento foi muito atencioso." },
  { id: 4, evento: "Baile de Gala APAE", organizador: "Roberto Castro", data: "2024-09-01", nota: 5, resumo: "Perfeito do início ao fim. Muito obrigado!", comentario: "Trabalho excepcional. A decoração das mesas e a apresentação do buffet foram elogiadas por todos os convidados. A equipe foi extremamente cordial e eficiente." },
  { id: 5, evento: "Formatura Medicina USP", organizador: "Marina Oliveira", data: "2024-11-01", nota: 4, resumo: "Boa qualidade, preço justo.", comentario: "O serviço foi bom. Algumas opções do cardápio poderiam ser mais variadas, mas a qualidade geral foi satisfatória. A equipe foi simpática e o atendimento foi bom durante todo o evento." },
];

const desempenho = [
  { criterio: "Pontualidade", nota: 4.9 },
  { criterio: "Qualidade", nota: 4.8 },
  { criterio: "Comunicação", nota: 4.7 },
  { criterio: "Custo-benefício", nota: 4.6 },
];

export function listarAvaliacoes() {
  return avaliacoes;
}

export function listarDesempenho() {
  return desempenho;
}
