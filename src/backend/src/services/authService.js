import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import env from "../config/env.js";
import HttpError from "../utils/HttpError.js";
import { cnpjValido, somenteDigitos } from "../utils/cnpj.js";
import { cpfValido } from "../utils/cpf.js";
import { exigirObjeto, texto, vazio } from "../utils/validacao.js";

export const CUSTO_BCRYPT = 10;
const PERFIS_CADASTRO = ["organizador", "fornecedor"]; // admin não se cadastra pela API
export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Usado quando o e-mail não existe, para o login levar o mesmo tempo
// e não revelar quais e-mails estão cadastrados.
export const HASH_FALSO = bcrypt.hashSync("senha-que-nao-existe", CUSTO_BCRYPT);

// Regras de senha do cadastro e da redefinição. Devolve a mensagem de erro, ou null se estiver certa.
export function erroDaSenha(senha) {
  if (vazio(senha)) return 'O campo "senha" é obrigatório.';
  if (typeof senha !== "string" || senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  if (senha.length > 72) return "A senha deve ter no máximo 72 caracteres."; // limite do bcrypt
  return null;
}

// Dados do usuário que podem ir para o front (nunca o senha_hash).
export const publico = ({ id, nome, email, perfil, status }) => ({ id, nome, email, perfil, status });

export async function registrar(dados) {
  exigirObjeto(dados);

  const erros = [];
  const nome = texto(dados, "nome", "nome", { obrigatorio: true, max: 120 }, erros);
  const email = texto(dados, "email", "e-mail", { obrigatorio: true, max: 160 }, erros)?.toLowerCase();
  if (email && !EMAIL_VALIDO.test(email)) erros.push("Informe um e-mail válido.");

  const { senha, perfil } = dados;
  const erroSenha = erroDaSenha(senha);
  if (erroSenha) erros.push(erroSenha);

  if (vazio(perfil)) erros.push('O campo "perfil" é obrigatório.');
  else if (!PERFIS_CADASTRO.includes(perfil)) erros.push('O perfil deve ser "organizador" ou "fornecedor".');

  // Documento: fornecedor se cadastra como empresa (CNPJ obrigatório); organizador
  // escolhe entre CNPJ (empresa) e CPF (pessoa física) e manda só um dos dois.
  // Aceita com ou sem máscara e grava só os dígitos.
  let cnpj = null;
  let cpf = null;
  const temCnpj = !vazio(dados.cnpj);
  const temCpf = !vazio(dados.cpf);
  if (temCpf && perfil === "fornecedor") erros.push("Fornecedores se cadastram com CNPJ.");
  else if (temCnpj && temCpf) erros.push('Informe só um documento: "cnpj" ou "cpf".');
  else if (temCpf) {
    if (typeof dados.cpf !== "string" || !cpfValido(dados.cpf)) erros.push("CPF inválido.");
    else cpf = somenteDigitos(dados.cpf);
  } else if (temCnpj) {
    if (typeof dados.cnpj !== "string" || !cnpjValido(dados.cnpj)) erros.push("CNPJ inválido.");
    else cnpj = somenteDigitos(dados.cnpj);
  } else {
    erros.push(perfil === "organizador" ? 'Informe o "cnpj" ou o "cpf".' : 'O campo "cnpj" é obrigatório.');
  }

  if (erros.length) throw HttpError.badRequest(erros.join(" "));

  const [existentes] = await pool.query("SELECT email FROM usuarios WHERE email = ? OR cnpj = ? OR cpf = ?", [
    email,
    cnpj,
    cpf,
  ]);
  if (existentes.some((u) => u.email === email)) throw HttpError.conflict("Este e-mail já está cadastrado.");
  if (existentes.length) throw HttpError.conflict(`Este ${cpf ? "CPF" : "CNPJ"} já está cadastrado.`);

  const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);
  try {
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nome, email, cnpj, cpf, senha_hash, perfil, status) VALUES (?, ?, ?, ?, ?, ?, 'pendente')",
      [nome, email, cnpj, cpf, senhaHash, perfil],
    );
    return { id: resultado.insertId, nome, email, cnpj, cpf, perfil, status: "pendente" };
  } catch (err) {
    // dois cadastros com o mesmo e-mail (ou documento) ao mesmo tempo
    if (err.code === "ER_DUP_ENTRY") {
      throw HttpError.conflict(
        err.message.includes("uq_usuarios_cnpj")
          ? "Este CNPJ já está cadastrado."
          : err.message.includes("uq_usuarios_cpf")
            ? "Este CPF já está cadastrado."
            : "Este e-mail já está cadastrado.",
      );
    }
    throw err;
  }
}

export async function login(dados) {
  exigirObjeto(dados);
  const { email, senha } = dados;
  if (vazio(email) || vazio(senha) || typeof email !== "string" || typeof senha !== "string") {
    throw HttpError.badRequest("Informe e-mail e senha.");
  }

  const [linhas] = await pool.query(
    "SELECT id, nome, email, senha_hash, perfil, status, motivo_rejeicao FROM usuarios WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  const usuario = linhas[0];
  const senhaConfere = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FALSO);
  if (!usuario || !senhaConfere) throw HttpError.unauthorized("E-mail ou senha incorretos.");

  // Só conta o status depois da senha certa, para não expor dados de outras contas.
  if (usuario.status === "pendente") {
    throw HttpError.forbidden("Seu cadastro ainda está aguardando a aprovação do administrador.");
  }
  if (usuario.status === "rejeitado") {
    throw HttpError.forbidden(`Seu cadastro foi rejeitado pelo administrador. Motivo: ${usuario.motivo_rejeicao}`);
  }

  const token = jwt.sign({ perfil: usuario.perfil }, env.jwt.segredo, {
    subject: String(usuario.id),
    expiresIn: env.jwt.expiraEm,
  });
  return { token, usuario: publico(usuario) };
}

// Valida o token e busca o usuário no banco a cada requisição: assim, se o admin
// rejeitar alguém, o token dele para de funcionar na hora (sem esperar expirar).
export async function usuarioDoToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.segredo);
  } catch (err) {
    throw HttpError.unauthorized(
      err.name === "TokenExpiredError" ? "Sua sessão expirou. Faça login novamente." : "Token inválido.",
    );
  }

  const [linhas] = await pool.query("SELECT id, nome, email, perfil, status FROM usuarios WHERE id = ?", [
    Number(payload.sub),
  ]);
  const usuario = linhas[0];
  if (!usuario) throw HttpError.unauthorized("Usuário do token não existe mais.");
  if (usuario.status !== "aprovado") throw HttpError.forbidden("Seu acesso não está mais liberado. Fale com o administrador.");
  return usuario;
}
