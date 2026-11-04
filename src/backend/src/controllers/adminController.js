import * as redefinicoesService from "../services/redefinicoesService.js";
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

export async function listarRedefinicoes(req, res) {
  res.json(await redefinicoesService.listarAbertos());
}

export async function gerarCodigoRedefinicao(req, res) {
  res.status(201).json(await redefinicoesService.gerarCodigo(req.usuario.id, req.params.id));
}
