import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import { exigirObjeto, inteiroPositivo, texto, validarId, vazio } from "../utils/validacao.js";
import emTransacao from "../utils/transacao.js";
import * as eventosService from "./eventosService.js";

// Propostas dos fornecedores. Cada proposta é para UM item de custo de um evento;
// um envio do fornecedor pode cobrir vários itens (uma linha por item).
// Status: em_analise → selecionada (escolhida pelo organizador) ou recusada (ao finalizar o evento).

// Só eventos publicados recebem propostas e podem ter a seleção alterada.
const STATUS_ABERTO = "em_andamento";

const DIAS_VALIDADE_PADRAO = 30;

const SELECT_PROPOSTAS = `
  SELECT p.id, p.item_id, p.fornecedor_id, u.nome AS fornecedor_nome,
         p.valor, p.descricao, p.validade, p.observacoes, p.status, p.criado_em,
         i.descricao AS item_descricao, i.categoria AS item_categoria, i.quantidade, i.unidade, i.valor_estimado,
         e.id AS evento_id, e.nome AS evento_nome, e.data_inicio AS evento_data_inicio, e.status AS evento_status
  FROM propostas p
  JOIN itens_custo i ON i.id = p.item_id
  JOIN eventos e ON e.id = i.evento_id
  JOIN usuarios u ON u.id = p.fornecedor_id`;

// "AAAA-MM-DD" de hoje + `dias`, no horário local do servidor.
function dataDaqui(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validarData(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) return null;
  const [ano, mes, dia] = valor.trim().split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return valor.trim();
}

async function eventoAberto(eventoId, conexao = pool) {
  const [linhas] = await conexao.query("SELECT id, status FROM eventos WHERE id = ?", [eventoId]);
  if (!linhas[0]) throw HttpError.notFound("Evento não encontrado.");
  if (linhas[0].status !== STATUS_ABERTO) {
    throw HttpError.conflict("Este evento não está recebendo propostas (só eventos publicados, em andamento).");
  }
}

// ── Fornecedor ─────────────────────────────────────────────────────────────

// Valida o corpo de POST /eventos/:id/propostas.
function validarEnvio(dados) {
  exigirObjeto(dados, "Envie a proposta em JSON.");
  const erros = [];

  if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
    erros.push('Informe pelo menos um item com preço: { "itens": [{ "item_id": 1, "valor": 1000 }] }.');
  }
  const itens = (Array.isArray(dados.itens) ? dados.itens : []).map((it, i) => {
    if (!it || typeof it !== "object") {
      erros.push(`Item ${i + 1}: formato inválido.`);
      return null;
    }
    if (!inteiroPositivo(it.item_id)) erros.push(`Item ${i + 1}: o "item_id" deve ser um número inteiro.`);
    if (typeof it.valor !== "number" || !Number.isFinite(it.valor) || it.valor <= 0) erros.push(`Item ${i + 1}: o valor deve ser um número maior que zero.`);
    return { item_id: it.item_id, valor: Math.round(it.valor * 100) / 100 };
  });
  const ids = itens.filter(Boolean).map((i) => i.item_id);
  if (new Set(ids).size !== ids.length) erros.push("Cada item só pode aparecer uma vez na proposta.");

  const descricao = texto(dados, "descricao", "descrição", { obrigatorio: false, max: 2000 }, erros);
  const observacoes = texto(dados, "observacoes", "observações", { obrigatorio: false, max: 2000 }, erros);

  let validade = dataDaqui(DIAS_VALIDADE_PADRAO);
  if (!vazio(dados.validade)) {
    validade = validarData(dados.validade);
    if (!validade) erros.push('A validade deve ser uma data no formato AAAA-MM-DD.');
    else if (validade < dataDaqui(0)) erros.push("A validade da proposta não pode ser uma data passada.");
  }

  if (erros.length) throw HttpError.badRequest(erros.join(" "));
  return { itens, descricao, observacoes, validade };
}

// Cria uma proposta por item, tudo ou nada.
export async function enviar(fornecedorId, eventoId, dados) {
  const id = validarId(eventoId);
  const envio = validarEnvio(dados);

  const criadas = await emTransacao(async (conexao) => {
    await eventoAberto(id, conexao);

    const ids = envio.itens.map((i) => i.item_id);
    const [itensEvento] = await conexao.query("SELECT id, descricao, tipo FROM itens_custo WHERE evento_id = ? AND id IN (?)", [id, ids]);
    const porId = new Map(itensEvento.map((i) => [i.id, i]));
    const fora = ids.filter((itemId) => !porId.has(itemId));
    if (fora.length) throw HttpError.badRequest(`Item ${fora.join(", ")} não pertence a este evento.`);

    // Custos fiscais, operacionais e variáveis não vêm de fornecedores.
    const naoCotaveis = itensEvento.filter((i) => i.tipo !== "fornecedor");
    if (naoCotaveis.length) {
      const nomes = naoCotaveis.map((i) => `"${i.descricao}"`).join(", ");
      throw HttpError.badRequest(`Estes itens não recebem propostas de fornecedores: ${nomes}.`);
    }

    const [repetidas] = await conexao.query("SELECT item_id FROM propostas WHERE fornecedor_id = ? AND item_id IN (?)", [fornecedorId, ids]);
    if (repetidas.length) {
      const nomes = repetidas.map((r) => `"${porId.get(r.item_id).descricao}"`).join(", ");
      throw HttpError.conflict(`Você já enviou proposta para ${nomes}.`);
    }

    const novos = [];
    for (const { item_id, valor } of envio.itens) {
      const [resultado] = await conexao.query("INSERT INTO propostas SET ?", [
        {
          item_id,
          fornecedor_id: fornecedorId,
          valor,
          // a coluna é obrigatória; sem texto do fornecedor, usa a descrição do item
          descricao: envio.descricao ?? `Proposta para ${porId.get(item_id).descricao}`,
          validade: envio.validade,
          observacoes: envio.observacoes,
          status: "em_analise",
        },
      ]);
      novos.push(resultado.insertId);
    }
    return novos;
  });

  const [linhas] = await pool.query(`${SELECT_PROPOSTAS} WHERE p.id IN (?) ORDER BY p.item_id`, [criadas]);
  return linhas;
}

export async function listarDoFornecedor(fornecedorId) {
  const [linhas] = await pool.query(`${SELECT_PROPOSTAS} WHERE p.fornecedor_id = ? ORDER BY p.criado_em DESC, p.id DESC`, [fornecedorId]);
  return linhas;
}

// ── Organizador ────────────────────────────────────────────────────────────

// Propostas recebidas por um evento (só o dono vê: fornecedores não veem os concorrentes).
export async function listarDoEvento(organizadorId, eventoId) {
  const id = validarId(eventoId);
  await eventosService.garantirDono(organizadorId, id);
  const [linhas] = await pool.query(`${SELECT_PROPOSTAS} WHERE e.id = ? ORDER BY p.item_id, p.valor, p.id`, [id]);
  return linhas;
}

// Define quais propostas estão escolhidas (no máximo uma por item).
// As que estavam selecionadas e não vieram na lista voltam para "em_analise".
export async function salvarSelecao(organizadorId, eventoId, dados) {
  const id = validarId(eventoId);
  exigirObjeto(dados, 'Envie a seleção em JSON: { "propostas": [1, 2] }.');
  const lista = dados.propostas;
  if (!Array.isArray(lista) || !lista.every(inteiroPositivo)) {
    throw HttpError.badRequest('Envie a lista de propostas escolhidas: { "propostas": [1, 2] } (pode ser vazia).');
  }
  if (new Set(lista).size !== lista.length) throw HttpError.badRequest("A mesma proposta apareceu mais de uma vez.");
  await eventosService.garantirDono(organizadorId, id);

  await emTransacao(async (conexao) => {
    await eventoAberto(id, conexao);

    if (lista.length) {
      const [escolhidas] = await conexao.query(
        "SELECT p.id, p.item_id FROM propostas p JOIN itens_custo i ON i.id = p.item_id WHERE i.evento_id = ? AND p.id IN (?)",
        [id, lista],
      );
      const achadas = new Set(escolhidas.map((p) => p.id));
      const fora = lista.filter((pid) => !achadas.has(pid));
      if (fora.length) throw HttpError.badRequest(`Proposta ${fora.join(", ")} não pertence a este evento.`);
      const itens = escolhidas.map((p) => p.item_id);
      if (new Set(itens).size !== itens.length) throw HttpError.badRequest("Escolha no máximo uma proposta por item.");
    }

    await conexao.query(
      "UPDATE propostas p JOIN itens_custo i ON i.id = p.item_id SET p.status = 'em_analise' WHERE i.evento_id = ? AND p.status = 'selecionada'",
      [id],
    );
    if (lista.length) await conexao.query("UPDATE propostas SET status = 'selecionada' WHERE id IN (?)", [lista]);
  });

  return listarDoEvento(organizadorId, id);
}

// Fecha a composição de custos: as não escolhidas viram "recusada" e o evento passa para "aguardando_data".
export async function finalizar(organizadorId, eventoId) {
  const id = validarId(eventoId);
  await eventosService.garantirDono(organizadorId, id);

  await emTransacao(async (conexao) => {
    await eventoAberto(id, conexao);
    const [[{ total }]] = await conexao.query(
      "SELECT COUNT(*) AS total FROM propostas p JOIN itens_custo i ON i.id = p.item_id WHERE i.evento_id = ? AND p.status = 'selecionada'",
      [id],
    );
    if (total === 0) throw HttpError.badRequest("Escolha pelo menos uma proposta antes de finalizar.");

    await conexao.query(
      "UPDATE propostas p JOIN itens_custo i ON i.id = p.item_id SET p.status = 'recusada' WHERE i.evento_id = ? AND p.status = 'em_analise'",
      [id],
    );
    await conexao.query("UPDATE eventos SET status = 'aguardando_data' WHERE id = ?", [id]);
  });

  return eventosService.buscarPorId(id);
}
