import HttpError from "../utils/HttpError.js";

// Erros do MySQL que são culpa dos dados enviados, não do servidor.
const ERROS_MYSQL_400 = {
  ER_CHECK_CONSTRAINT_VIOLATED: "Os dados enviados violam uma regra do banco de dados.",
  ER_NO_REFERENCED_ROW_2: "Registro relacionado não encontrado.",
  ER_DATA_TOO_LONG: "Um dos campos excede o tamanho máximo permitido.",
  ER_TRUNCATED_WRONG_VALUE: "Um dos campos tem um valor em formato inválido.",
  ER_DUP_ENTRY: "Já existe um registro com esses dados.",
};

// Rota inexistente.
export function naoEncontrado(req, res, next) {
  next(HttpError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

// Tratamento central: toda resposta de erro sai como { erro: "mensagem" }.
// eslint-disable-next-line no-unused-vars
export function tratarErros(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message });
  }

  // JSON mal formado no corpo da requisição (gerado pelo express.json()).
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "O corpo da requisição não é um JSON válido." });
  }

  if (err.code in ERROS_MYSQL_400) {
    return res.status(400).json({ erro: ERROS_MYSQL_400[err.code] });
  }

  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor." });
}
