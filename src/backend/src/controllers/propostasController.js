import * as propostasService from "../services/propostasService.js";

// Controllers só traduzem HTTP ↔ service (ver eventosController.js). req.usuario vem do middleware autenticar.

// Fornecedor envia proposta para um ou mais itens do evento.
export async function enviar(req, res) {
  const propostas = await propostasService.enviar(req.usuario.id, req.params.id, req.body);
  res.status(201).json(propostas);
}

export async function listarMinhas(req, res) {
  res.json(await propostasService.listarDoFornecedor(req.usuario.id));
}

// Organizador dono vê as propostas recebidas pelo evento.
export async function listarDoEvento(req, res) {
  res.json(await propostasService.listarDoEvento(req.usuario.id, req.params.id));
}

export async function salvarSelecao(req, res) {
  res.json(await propostasService.salvarSelecao(req.usuario.id, req.params.id, req.body));
}

export async function finalizar(req, res) {
  res.json(await propostasService.finalizar(req.usuario.id, req.params.id));
}
