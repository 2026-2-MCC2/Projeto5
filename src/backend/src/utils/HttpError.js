// Erro com status HTTP. Lançado pelos services e convertido em resposta pelo errorHandler.
export default class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }

  static badRequest(mensagem) {
    return new HttpError(400, mensagem);
  }

  static notFound(mensagem) {
    return new HttpError(404, mensagem);
  }
}
