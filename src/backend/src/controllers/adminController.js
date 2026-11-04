import * as usuariosService from "../services/usuariosService.js";

export async function listarPendentes(req, res) {
  res.json(await usuariosService.listarPendentes());
}

export async function listarUsuarios(req, res) {
  res.json(await usuariosService.listarUsuarios());
}

export async function aprovar(req, res) {
  res.json(await usuariosService.aprovar(req.params.id));
}

export async function rejeitar(req, res) {
  res.json(await usuariosService.rejeitar(req.params.id, req.body));
}
