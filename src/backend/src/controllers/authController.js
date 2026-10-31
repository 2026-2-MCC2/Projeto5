import * as authService from "../services/authService.js";

export async function registrar(req, res) {
  const usuario = await authService.registrar(req.body);
  res.status(201).json({
    mensagem: "Cadastro realizado! Aguarde a aprovação do administrador para fazer login.",
    usuario,
  });
}

export async function login(req, res) {
  res.json(await authService.login(req.body));
}

// Quem está logado (útil para o front restaurar a sessão a partir do token salvo).
export async function eu(req, res) {
  res.json(authService.publico(req.usuario));
}
