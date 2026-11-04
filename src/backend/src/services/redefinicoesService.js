import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import HttpError from "../utils/HttpError.js";
import emTransacao from "../utils/transacao.js";
import { exigirObjeto, validarId, vazio } from "../utils/validacao.js";
import { CUSTO_BCRYPT, EMAIL_VALIDO, HASH_FALSO, erroDaSenha } from "./authService.js";

// Redefinição de senha sem e-mail: o usuário pede, o admin gera um código, passa o código
// por fora do sistema e o usuário usa esse código para criar a senha nova.

const MINUTOS_VALIDADE = 30;
const MAX_TENTATIVAS = 5;
const TAMANHO_CODIGO = 8;
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O e 1/I, que se confundem ao ditar

// A resposta é sempre a mesma, para não revelar quais e-mails estão cadastrados.
const RESPOSTA_PEDIDO = "Se o e-mail estiver cadastrado, o pedido foi enviado ao administrador. Ele vai passar um código para você.";
const CODIGO_INVALIDO = "Código inválido ou expirado. Peça um novo código ao administrador.";

const normalizarEmail = (email) => email.trim().toLowerCase();
const normalizarCodigo = (codigo) => codigo.trim().toUpperCase();

function gerarTextoCodigo() {
  let codigo = "";
  for (let i = 0; i < TAMANHO_CODIGO; i++) codigo += ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)];
  return codigo;
}

// ── Usuário ────────────────────────────────────────────────────────────────

// Só contas aprovadas pedem redefinição. O admin fica de fora: ninguém acima dele gera o código.
// Um pedido em aberto vale até ser usado, então pedir de novo não cria outro.
export async function solicitar(dados) {
  exigirObjeto(dados);
  const { email } = dados;
  if (vazio(email) || typeof email !== "string" || !EMAIL_VALIDO.test(email.trim())) {
    throw HttpError.badRequest("Informe um e-mail válido.");
  }

  const [usuarios] = await pool.query("SELECT id FROM usuarios WHERE email = ? AND status = 'aprovado' AND perfil <> 'admin'", [
    normalizarEmail(email),
  ]);
  const usuario = usuarios[0];
  if (usuario) {
    const [abertos] = await pool.query("SELECT id FROM redefinicoes_senha WHERE usuario_id = ? AND usado_em IS NULL LIMIT 1", [usuario.id]);
    if (!abertos.length) await pool.query("INSERT INTO redefinicoes_senha (usuario_id) VALUES (?)", [usuario.id]);
  }
  return { mensagem: RESPOSTA_PEDIDO };
}

export async function redefinir(dados) {
  exigirObjeto(dados);
  const { email, codigo, senha } = dados;

  const erros = [];
  if (vazio(email) || typeof email !== "string") erros.push("Informe o e-mail.");
  if (vazio(codigo) || typeof codigo !== "string") erros.push("Informe o código.");
  const erroSenha = erroDaSenha(senha);
  if (erroSenha) erros.push(erroSenha);
  if (erros.length) throw HttpError.badRequest(erros.join(" "));

  // A tentativa errada precisa ficar gravada: por isso a função devolve false e o erro
  // é lançado depois da transação (um erro aqui dentro desfaria a contagem).
  const trocou = await emTransacao(async (conexao) => {
    const [linhas] = await conexao.query(
      `SELECT r.id, r.usuario_id, r.codigo_hash, r.tentativas, r.codigo_expira_em > NOW() AS dentro_do_prazo
       FROM redefinicoes_senha r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE u.email = ? AND u.status = 'aprovado' AND r.usado_em IS NULL AND r.codigo_hash IS NOT NULL
       ORDER BY r.id DESC
       LIMIT 1
       FOR UPDATE`,
      [normalizarEmail(email)],
    );
    const pedido = linhas[0];
    const podeConferir = Boolean(pedido?.dentro_do_prazo) && pedido.tentativas < MAX_TENTATIVAS;

    // Compara mesmo sem pedido válido, para a resposta levar o mesmo tempo.
    const confere = await bcrypt.compare(normalizarCodigo(codigo), podeConferir ? pedido.codigo_hash : HASH_FALSO);
    if (!podeConferir) return false;
    if (!confere) {
      await conexao.query("UPDATE redefinicoes_senha SET tentativas = tentativas + 1 WHERE id = ?", [pedido.id]);
      return false;
    }

    const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);
    await conexao.query("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [senhaHash, pedido.usuario_id]);
    await conexao.query("UPDATE redefinicoes_senha SET usado_em = NOW(), codigo_hash = NULL WHERE id = ?", [pedido.id]);
    return true;
  });

  if (!trocou) throw HttpError.badRequest(CODIGO_INVALIDO);
  return { mensagem: "Senha alterada com sucesso. Faça login com a senha nova." };
}

// ── Admin ──────────────────────────────────────────────────────────────────

// Pedidos ainda não usados. `codigo_ativo` diz se já existe um código valendo.
export async function listarAbertos() {
  const [linhas] = await pool.query(
    `SELECT r.id, r.solicitado_em, r.gerado_em, r.codigo_expira_em,
            (r.codigo_hash IS NOT NULL AND r.codigo_expira_em > NOW() AND r.tentativas < ?) AS codigo_ativo,
            u.nome, u.email, u.perfil
     FROM redefinicoes_senha r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.usado_em IS NULL AND u.status = 'aprovado'
     ORDER BY r.solicitado_em, r.id`,
    [MAX_TENTATIVAS],
  );
  return linhas.map((l) => ({ ...l, codigo_ativo: Boolean(l.codigo_ativo) }));
}

// Gera um código novo, que substitui o anterior. Ele só aparece nesta resposta: no banco fica o hash.
export async function gerarCodigo(adminId, id) {
  const pedidoId = validarId(id);
  const [linhas] = await pool.query("SELECT id FROM redefinicoes_senha WHERE id = ? AND usado_em IS NULL", [pedidoId]);
  if (!linhas[0]) throw HttpError.notFound("Pedido de redefinição não encontrado.");

  const codigo = gerarTextoCodigo();
  const codigoHash = await bcrypt.hash(codigo, CUSTO_BCRYPT);
  await pool.query(
    `UPDATE redefinicoes_senha
     SET codigo_hash = ?, codigo_expira_em = DATE_ADD(NOW(), INTERVAL ? MINUTE), tentativas = 0, gerado_por = ?, gerado_em = NOW()
     WHERE id = ?`,
    [codigoHash, MINUTOS_VALIDADE, adminId, pedidoId],
  );
  return { codigo, validade_minutos: MINUTOS_VALIDADE };
}
