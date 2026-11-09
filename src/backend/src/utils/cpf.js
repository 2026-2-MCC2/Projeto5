// CPF: aceita com ou sem máscara (000.000.000-00) e guarda só os 11 dígitos.
// A mesma regra existe no front (src/frontend/src/utils/cpf.js), só para avisar antes de enviar.
import { somenteDigitos } from "./cnpj.js";

// Dígito verificador: pesos decrescentes a partir de (tamanho + 1); resto 10 vira 0.
function digito(base) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const d1 = digito(cpf.slice(0, 9));
  const d2 = digito(cpf.slice(0, 9) + d1);
  return cpf.endsWith(`${d1}${d2}`);
}
