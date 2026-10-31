// Erro com status HTTP. Lançado pelos services e convertido em resposta pelo errorHandler.
export default class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }

  static badRequest(mensagem) {
    return new HttpError(400, mensagem);
  }

  // Não está logado (sem token, token inválido/expirado, senha errada).
  static unauthorized(mensagem) {
    return new HttpError(401, mensagem);
  }

  // Está logado, mas não tem permissão para isso.
  static forbidden(mensagem) {
    return new HttpError(403, mensagem);
  }

  static notFound(mensagem) {
    return new HttpError(404, mensagem);
  }

  static conflict(mensagem) {
    return new HttpError(409, mensagem);
  }
}
