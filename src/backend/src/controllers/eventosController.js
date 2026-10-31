import * as eventosService from "../services/eventosService.js";

// Controllers só traduzem HTTP ↔ service. Erros lançados aqui vão direto
// para o middleware tratarErros (o Express 5 captura rejeições de funções async).

export async function listar(req, res) {
  const eventos = await eventosService.listar(req.query);
  res.json(eventos);
}

export async function buscarPorId(req, res) {
  const evento = await eventosService.buscarPorId(req.params.id);
  res.json(evento);
}

export async function criar(req, res) {
  const evento = await eventosService.criar(req.body);
  res.status(201).location(`/api/eventos/${evento.id}`).json(evento);
}

export async function atualizar(req, res) {
  const evento = await eventosService.atualizar(req.params.id, req.body);
  res.json(evento);
}

export async function remover(req, res) {
  await eventosService.remover(req.params.id);
  res.status(204).end();
}
