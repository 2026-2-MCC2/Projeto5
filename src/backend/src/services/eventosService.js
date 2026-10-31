import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import { exigirObjeto, inteiroPositivo, texto, validarId, vazio } from "../utils/validacao.js";

export const STATUS_EVENTO = ["rascunho", "aguardando_data", "em_andamento", "concluido", "cancelado"];

const COLUNAS = `id, organizador_id, nome, descricao, data_inicio, data_fim, local,
  publico_minimo, publico_maximo, margem_lucro, status, criado_em`;

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
  };

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
async function garantirDono(organizadorId, eventoId) {
  const [linhas] = await pool.query("SELECT organizador_id FROM eventos WHERE id = ?", [eventoId]);
  if (!linhas[0]) throw HttpError.notFound("Evento não encontrado.");
  if (linhas[0].organizador_id !== organizadorId) {
    throw HttpError.forbidden("Você só pode alterar os seus próprios eventos.");
  }
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function listar({ organizador_id, status } = {}) {
  const filtros = [];
  const valores = [];

  if (!vazio(organizador_id)) {
    filtros.push("organizador_id = ?");
    valores.push(validarId(organizador_id, "organizador_id"));
  }
  if (!vazio(status)) {
    if (!STATUS_EVENTO.includes(status)) throw HttpError.badRequest(`Status inválido. Use: ${STATUS_EVENTO.join(", ")}.`);
    filtros.push("status = ?");
    valores.push(status);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
  const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM eventos ${where} ORDER BY data_inicio`, valores);
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM eventos WHERE id = ?`, [validarId(id)]);
  if (!linhas[0]) throw HttpError.notFound("Evento não encontrado.");
  return linhas[0];
}

// O dono é sempre quem está logado (vem do token); organizador_id no corpo é ignorado.
export async function criar(organizadorId, dados) {
  const evento = validarEvento(dados);
  const [resultado] = await pool.query("INSERT INTO eventos SET ?", [{ ...evento, organizador_id: organizadorId }]);
  return buscarPorId(resultado.insertId);
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
