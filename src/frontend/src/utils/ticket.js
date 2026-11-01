// Ticket estimado (preço do ingresso) de um evento.
// Margem sobre o preço de venda: ticket = custo ÷ (público × (1 − margem)).
// Ex.: custo R$ 30.000, 300 pessoas, margem 25% -> 30.000 ÷ (300 × 0,75) = R$ 133,33.
// A margem vem como fração (0.25 = 25%) e o banco limita a 0–0.99, então (1 − margem) nunca é zero.

export function precoTicket(custo, publico, margem = 0) {
  if (!(custo > 0) || !(publico > 0) || !(margem < 1)) return null;
  return custo / (publico * (1 - margem));
}

// Os dois cenários do evento: público mínimo (ingresso mais caro) e máximo (mais barato).
// A receita e o lucro totais são iguais nos dois: o preço se ajusta ao público.
export function cenariosTicket({ custo, publicoMinimo, publicoMaximo, margem = 0 }) {
  const cenario = (rotulo, publico) => {
    const preco = precoTicket(custo, publico, margem);
    if (preco === null) return null;
    const custoPorPessoa = custo / publico;
    return { rotulo, publico, preco, custoPorPessoa, lucroPorIngresso: preco - custoPorPessoa };
  };
  const minimo = cenario("Público mínimo", publicoMinimo);
  const maximo = cenario("Público máximo", publicoMaximo);
  if (!minimo || !maximo) return null;
  const receita = custo / (1 - margem);
  return { minimo, maximo, receita, lucro: receita - custo };
}

// Valor com centavos: 133.333 -> "R$ 133,33"
export const moedaCentavos = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
