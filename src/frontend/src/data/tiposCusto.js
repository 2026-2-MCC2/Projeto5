// Tipos de item de custo como a API grava (valor) e como aparecem na tela (rótulo).
// Só itens do tipo "fornecedor" recebem propostas; os outros entram no custo pelo valor estimado.
export const TIPOS_CUSTO = [
  { valor: "fornecedor", rotulo: "Fornecedor" },
  { valor: "fiscal", rotulo: "Fiscal" },
  { valor: "operacional", rotulo: "Operacional" },
  { valor: "variavel", rotulo: "Variável" },
];

export const ROTULO_TIPO_CUSTO = Object.fromEntries(TIPOS_CUSTO.map((t) => [t.valor, t.rotulo]));
