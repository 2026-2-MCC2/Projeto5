import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import { exigirObjeto, inteiroPositivo, texto, validarId, vazio } from "../utils/validacao.js";
import emTransacao from "../utils/transacao.js";
import * as itensService from "./itensService.js";

export const STATUS_EVENTO = ["rascunho", "aguardando_data", "em_andamento", "concluido", "cancelado"];

// Mesma lista de front/src/data/categorias.js (CATEGORIAS_EVENTO).
export const CATEGORIAS_EVENTO = ["Corporativo", "Festival & Show", "Casamento", "Formatura", "Social", "Esportivo"];

// orcamento = soma dos valores estimados dos itens; total_propostas = propostas recebidas em todos os itens;
// organizador_nome e categorias_itens (o que o evento precisa contratar) servem à tela de oportunidades do fornecedor.
const SELECT_EVENTOS = `
  SELECT e.id, e.organizador_id, u.nome AS organizador_nome, e.nome, e.descricao, e.categoria, e.data_inicio, e.data_fim, e.local,
         e.publico_minimo, e.publico_maximo, e.margem_lucro, e.status, e.criado_em,
         (SELECT COALESCE(SUM(i.valor_estimado), 0) FROM itens_custo i WHERE i.evento_id = e.id) AS orcamento,
         (SELECT COUNT(*) FROM propostas p JOIN itens_custo i ON i.id = p.item_id WHERE i.evento_id = e.id) AS total_propostas,
         (SELECT GROUP_CONCAT(DISTINCT i.categoria ORDER BY i.categoria SEPARATOR '|') FROM itens_custo i WHERE i.evento_id = e.id AND i.tipo = 'fornecedor') AS categorias_itens
  FROM eventos e
  JOIN usuarios u ON u.id = e.organizador_id`;

// categorias_itens chega do MySQL como "A|B"; a API devolve como lista.
const formatar = (linha) => ({ ...linha, categorias_itens: linha.categorias_itens ? linha.categorias_itens.split("|") : [] });

// O fornecedor não vê quantas propostas o evento já recebeu.
function paraPerfil(evento, usuario) {
  if (usuario?.perfil !== "fornecedor") return evento;
  const { total_propostas, ...resto } = evento;
  return resto;
}

// ── Validação ──────────────────────────────────────────────────────────────

// Aceita "2026-12-12", "2026-12-12 11:00", "2026-12-12T11:00:00" etc.
// Devolve no formato DATETIME do MySQL, ou null se a data for inválida.
function paraDatetime(valor) {
  if (typeof valor !== "string") return null;
  const m = valor.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;

  const [, ano, mes, dia, hora = "00", min = "00", seg = "00"] = m;
  const data = new Date(Date.UTC(ano, mes - 1, dia, hora, min, seg));
  // rejeita datas que "transbordam", como 2026-02-31
  if (data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== Number(dia) || hora > 23 || min > 59 || seg > 59) {
    return null;
  }
  return `${ano}-${mes}-${dia} ${hora}:${min}:${seg}`;
}

// Valida o corpo de POST/PUT e devolve os dados já normalizados.
// Junta todos os problemas numa mensagem só para o front mostrar de uma vez.
function validarEvento(dados) {
  exigirObjeto(dados, "Envie os dados do evento em JSON.");

  const erros = [];
  const evento = {
    nome: texto(dados, "nome", "nome", { obrigatorio: true, max: 150 }, erros),
    descricao: texto(dados, "descricao", "descrição", { obrigatorio: false }, erros),
    local: texto(dados, "local", "local", { obrigatorio: true, max: 200 }, erros),
    categoria: texto(dados, "categoria", "categoria", { obrigatorio: false }, erros),
  };
  if (evento.categoria && !CATEGORIAS_EVENTO.includes(evento.categoria)) {
    erros.push(`Categoria inválida. Use: ${CATEGORIAS_EVENTO.join(", ")}.`);
  }

  for (const [campo, rotulo] of [["data_inicio", "data de início"], ["data_fim", "data de fim"]]) {
    if (vazio(dados[campo])) {
      erros.push(`O campo "${rotulo}" é obrigatório.`);
    } else {
      evento[campo] = paraDatetime(dados[campo]);
      if (!evento[campo]) erros.push(`O campo "${rotulo}" deve ser uma data válida (AAAA-MM-DD ou AAAA-MM-DD HH:MM).`);
    }
  }
  if (evento.data_inicio && evento.data_fim && evento.data_fim < evento.data_inicio) {
    erros.push("A data de fim não pode ser anterior à data de início.");
  }

  for (const [campo, rotulo] of [["publico_minimo", "público mínimo"], ["publico_maximo", "público máximo"]]) {
    if (vazio(dados[campo])) {
      erros.push(`O campo "${rotulo}" é obrigatório.`);
    } else if (!inteiroPositivo(dados[campo])) {
      erros.push(`O campo "${rotulo}" deve ser um número inteiro maior que zero.`);
    } else {
      evento[campo] = dados[campo];
    }
  }
  if (evento.publico_minimo && evento.publico_maximo && evento.publico_minimo > evento.publico_maximo) {
    erros.push("O público mínimo não pode ser maior que o público máximo.");
  }

  if (vazio(dados.margem_lucro)) {
    evento.margem_lucro = 0;
  } else if (typeof dados.margem_lucro !== "number" || !Number.isFinite(dados.margem_lucro)) {
    erros.push('O campo "margem de lucro" deve ser um número (ex.: 0.25 para 25%).');
  } else if (dados.margem_lucro < 0 || dados.margem_lucro > 0.99) {
    erros.push("A margem de lucro deve estar entre 0 e 0.99 (ex.: 0.25 para 25%).");
  } else {
    evento.margem_lucro = dados.margem_lucro;
  }

  if (vazio(dados.status)) {
    evento.status = "rascunho";
  } else if (!STATUS_EVENTO.includes(dados.status)) {
    erros.push(`Status inválido. Use: ${STATUS_EVENTO.join(", ")}.`);
  } else {
    evento.status = dados.status;
  }

  if (erros.length) throw HttpError.badRequest(erros.join(" "));
  return evento;
}

// Só o organizador dono pode mexer no evento.
export async function garantirDono(organizadorId, eventoId) {
  const [linhas] = await pool.query("SELECT organizador_id FROM eventos WHERE id = ?", [eventoId]);
  if (!linhas[0]) throw HttpError.notFound("Evento não encontrado.");
  if (linhas[0].organizador_id !== organizadorId) {
    throw HttpError.forbidden("Você só pode alterar os seus próprios eventos.");
  }
}

// Quem pode ver um evento: o admin vê todos, o organizador só os próprios e o fornecedor
// os abertos para cotação ou aqueles em que já enviou proposta. Para os demais, o evento
// "não existe" (404), para não revelar rascunhos de outras pessoas.
async function garantirVisivel(usuario, evento) {
  if (usuario.perfil === "admin") return;
  if (usuario.perfil === "organizador" && evento.organizador_id === usuario.id) return;
  if (usuario.perfil === "fornecedor") {
    if (evento.status === "em_andamento") return;
    const [linhas] = await pool.query(
      "SELECT 1 FROM propostas p JOIN itens_custo i ON i.id = p.item_id WHERE i.evento_id = ? AND p.fornecedor_id = ? LIMIT 1",
      [evento.id, usuario.id],
    );
    if (linhas.length) return;
  }
  throw HttpError.notFound("Evento não encontrado.");
}

// ── CRUD ───────────────────────────────────────────────────────────────────

// Os filtros da URL só reduzem o que o perfil já pode ver.
export async function listar(usuario, { organizador_id, status } = {}) {
  const filtros = [];
  const valores = [];

  if (usuario.perfil === "organizador") {
    filtros.push("e.organizador_id = ?");
    valores.push(usuario.id);
  } else if (usuario.perfil === "fornecedor") {
    filtros.push("e.status = 'em_andamento'");
  }

  if (!vazio(organizador_id)) {
    filtros.push("e.organizador_id = ?");
    valores.push(validarId(organizador_id, "organizador_id"));
  }
  if (!vazio(status)) {
    if (!STATUS_EVENTO.includes(status)) throw HttpError.badRequest(`Status inválido. Use: ${STATUS_EVENTO.join(", ")}.`);
    filtros.push("e.status = ?");
    valores.push(status);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
  const [linhas] = await pool.query(`${SELECT_EVENTOS} ${where} ORDER BY e.data_inicio`, valores);
  return linhas.map((linha) => paraPerfil(formatar(linha), usuario));
}

// Sem `usuario`, é uso interno da API (depois de criar ou alterar) e não confere a visibilidade.
export async function buscarPorId(id, usuario) {
  const [linhas] = await pool.query(`${SELECT_EVENTOS} WHERE e.id = ?`, [validarId(id)]);
  if (!linhas[0]) throw HttpError.notFound("Evento não encontrado.");
  if (usuario) await garantirVisivel(usuario, linhas[0]);
  return paraPerfil(formatar(linhas[0]), usuario);
}

// O dono é sempre quem está logado (vem do token); organizador_id no corpo é ignorado.
// `itens` é opcional: permite criar o evento já com a composição de custos, tudo ou nada.
export async function criar(organizadorId, dados) {
  const evento = validarEvento(dados);
  const itens = dados.itens === undefined ? [] : itensService.validarItens(dados.itens);
  if (itens.some((i) => i.id !== null)) throw HttpError.badRequest("Itens de um evento novo não podem ter id.");

  const id = await emTransacao(async (conexao) => {
    const [resultado] = await conexao.query("INSERT INTO eventos SET ?", [{ ...evento, organizador_id: organizadorId }]);
    await itensService.sincronizar(conexao, resultado.insertId, itens);
    return resultado.insertId;
  });
  return buscarPorId(id);
}

// PUT substitui o evento inteiro: os campos obrigatórios precisam vir de novo.
// O organizador dono do evento não muda.
export async function atualizar(organizadorId, id, dados) {
  const eventoId = validarId(id);
  const evento = validarEvento(dados);
  await garantirDono(organizadorId, eventoId);

  await pool.query("UPDATE eventos SET ? WHERE id = ?", [evento, eventoId]);
  return buscarPorId(eventoId);
}

// Itens de custo e propostas do evento são apagados junto (ON DELETE CASCADE).
export async function remover(organizadorId, id) {
  const eventoId = validarId(id);
  await garantirDono(organizadorId, eventoId);
  await pool.query("DELETE FROM eventos WHERE id = ?", [eventoId]);
}
