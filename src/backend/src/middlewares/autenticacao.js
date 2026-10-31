import HttpError from "../utils/HttpError.js";
import { usuarioDoToken } from "../services/authService.js";

// Exige o cabeçalho "Authorization: Bearer <token>" e coloca o usuário em req.usuario.
export async function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    throw HttpError.unauthorized("Faça login para acessar este recurso.");
  }
  req.usuario = await usuarioDoToken(token);
  next();
}

// Usar depois de autenticar: router.post("/", autenticar, permitirPerfis("organizador"), ...)
export function permitirPerfis(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      throw HttpError.forbidden("Você não tem permissão para acessar este recurso.");
    }
    next();
  };
}
