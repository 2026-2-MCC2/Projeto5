import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import { exigirObjeto, texto, validarId } from "../utils/validacao.js";

// Regras do painel do admin: aprovar e rejeitar cadastros.

export async function listarPendentes() {
  const [linhas] = await pool.query(
    "SELECT id, nome, email, perfil, status, criado_em FROM usuarios WHERE status = 'pendente' ORDER BY criado_em",
  );
  return linhas;
}

async function buscarParaModerar(id) {
  const [linhas] = await pool.query("SELECT id, nome, email, perfil, status FROM usuarios WHERE id = ?", [
    validarId(id),
  ]);
  const usuario = linhas[0];
  if (!usuario) throw HttpError.notFound("Usuário não encontrado.");
  if (usuario.perfil === "admin") throw HttpError.badRequest("Não é possível aprovar ou rejeitar um administrador.");
  return usuario;
}

// Aprova um cadastro pendente, ou reverte uma rejeição.
export async function aprovar(id) {
  const usuario = await buscarParaModerar(id);
  if (usuario.status === "aprovado") throw HttpError.badRequest("Este usuário já está aprovado.");

  await pool.query("UPDATE usuarios SET status = 'aprovado', motivo_rejeicao = NULL WHERE id = ?", [usuario.id]);
  return { ...usuario, status: "aprovado", motivo_rejeicao: null };
}

// Rejeita um cadastro (ou bloqueia um usuário já aprovado). O motivo é obrigatório
// e aparece para o usuário quando ele tentar fazer login.
export async function rejeitar(id, dados) {
  exigirObjeto(dados, 'Envie o motivo em JSON: { "motivo": "..." }.');
  const erros = [];
  const motivo = texto(dados, "motivo", "motivo", { obrigatorio: true, max: 500 }, erros);
  if (erros.length) throw HttpError.badRequest(erros.join(" "));

  const usuario = await buscarParaModerar(id);
  if (usuario.status === "rejeitado") throw HttpError.badRequest("Este usuário já está rejeitado.");

  await pool.query("UPDATE usuarios SET status = 'rejeitado', motivo_rejeicao = ? WHERE id = ?", [motivo, usuario.id]);
  return { ...usuario, status: "rejeitado", motivo_rejeicao: motivo };
}
