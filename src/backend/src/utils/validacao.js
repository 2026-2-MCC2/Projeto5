import HttpError from "./HttpError.js";

// Funções de validação usadas por mais de um service.

export const vazio = (valor) =>
  valor === undefined || valor === null || (typeof valor === "string" && valor.trim() === "");

export const inteiroPositivo = (valor) => Number.isInteger(valor) && valor > 0;

// Lê um campo de texto do corpo. Empilha a mensagem em `erros` em vez de lançar,
// para o service devolver todos os problemas de uma vez.
export function texto(dados, campo, rotulo, { obrigatorio, max }, erros) {
  const valor = dados[campo];
  if (vazio(valor)) {
    if (obrigatorio) erros.push(`O campo "${rotulo}" é obrigatório.`);
    return null;
  }
  if (typeof valor !== "string") {
    erros.push(`O campo "${rotulo}" deve ser um texto.`);
    return null;
  }
  if (max && valor.trim().length > max) erros.push(`O campo "${rotulo}" deve ter no máximo ${max} caracteres.`);
  return valor.trim();
}

export function exigirObjeto(dados, mensagem = "Envie os dados em JSON.") {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw HttpError.badRequest(mensagem);
}

export function validarId(id, rotulo = "id") {
  const numero = Number(id);
  if (!inteiroPositivo(numero)) throw HttpError.badRequest(`O ${rotulo} deve ser um número inteiro maior que zero.`);
  return numero;
}
