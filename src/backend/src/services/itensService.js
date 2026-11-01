import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import { inteiroPositivo, texto, vazio } from "../utils/validacao.js";

// Itens de custo de um evento (a "composição de custos" do front).

export const TIPOS_ITEM = ["fornecedor", "fiscal", "operacional", "variavel"];

// valor_acordado = valor da proposta selecionada para o item (null enquanto não houver).
const SELECT_ITENS = `
  SELECT i.id, i.evento_id, i.descricao, i.categoria, i.tipo, i.quantidade, i.unidade, i.valor_estimado,
         (SELECT p.valor FROM propostas p WHERE p.item_id = i.id AND p.status = 'selecionada' LIMIT 1) AS valor_acordado,
         (SELECT COUNT(*) FROM propostas p WHERE p.item_id = i.id) AS total_propostas
  FROM itens_custo i
  WHERE i.evento_id = ?
  ORDER BY i.id`;

const numero = (valor) => typeof valor === "number" && Number.isFinite(valor);

// Valida a lista inteira; as mensagens dizem o número do item ("Item 2: ...").
export function validarItens(lista) {
  if (!Array.isArray(lista)) throw HttpError.badRequest('Envie os itens como uma lista: { "itens": [ ... ] }.');

  const erros = [];
  const itens = lista.map((dados, i) => {
    const errosItem = [];
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      erros.push(`Item ${i + 1}: formato inválido.`);
      return null;
    }

    const item = {
      id: dados.id ?? null,
      descricao: texto(dados, "descricao", "descrição", { obrigatorio: true, max: 200 }, errosItem),
      categoria: texto(dados, "categoria", "categoria", { obrigatorio: true, max: 80 }, errosItem),
      unidade: texto(dados, "unidade", "unidade", { obrigatorio: false, max: 30 }, errosItem) ?? "unidade",
      tipo: vazio(dados.tipo) ? "fornecedor" : dados.tipo,
      quantidade: vazio(dados.quantidade) ? 1 : dados.quantidade,
      valor_estimado: vazio(dados.valor_estimado) ? 0 : dados.valor_estimado,
    };

    if (item.id !== null && !inteiroPositivo(item.id)) errosItem.push('o "id" deve ser um número inteiro.');
    if (!TIPOS_ITEM.includes(item.tipo)) errosItem.push(`tipo inválido (use: ${TIPOS_ITEM.join(", ")}).`);
    if (!numero(item.quantidade) || item.quantidade <= 0) errosItem.push("a quantidade deve ser um número maior que zero.");
    if (!numero(item.valor_estimado) || item.valor_estimado < 0) errosItem.push("o valor estimado deve ser um número maior ou igual a zero.");

    erros.push(...errosItem.map((e) => `Item ${i + 1}: ${e}`));
    return item;
  });

  if (erros.length) throw HttpError.badRequest(erros.join(" "));
  return itens;
}

export async function listar(eventoId, conexao = pool) {
  const [linhas] = await conexao.query(SELECT_ITENS, [eventoId]);
  return linhas;
}

// Deixa os itens do evento iguais à lista recebida, dentro da transação de `conexao`:
// com id existente → atualiza; sem id → cria; os que não vieram → apaga.
// Atualizar em vez de apagar tudo preserva as propostas já recebidas para cada item.
export async function sincronizar(conexao, eventoId, itens) {
  const [atuais] = await conexao.query("SELECT id FROM itens_custo WHERE evento_id = ?", [eventoId]);
  const idsAtuais = new Set(atuais.map((l) => l.id));

  const desconhecido = itens.find((i) => i.id !== null && !idsAtuais.has(i.id));
  if (desconhecido) throw HttpError.badRequest(`O item ${desconhecido.id} não pertence a este evento.`);

  const mantidos = new Set();
  for (const { id, ...campos } of itens) {
    if (id === null) {
      await conexao.query("INSERT INTO itens_custo SET ?", [{ ...campos, evento_id: eventoId }]);
    } else {
      await conexao.query("UPDATE itens_custo SET ? WHERE id = ?", [campos, id]);
      mantidos.add(id);
    }
  }

  const removidos = [...idsAtuais].filter((id) => !mantidos.has(id));
  if (removidos.length) await conexao.query("DELETE FROM itens_custo WHERE id IN (?)", [removidos]);
}
