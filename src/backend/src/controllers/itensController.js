import * as eventosService from "../services/eventosService.js";
import * as itensService from "../services/itensService.js";
import emTransacao from "../utils/transacao.js";
import { validarId } from "../utils/validacao.js";

export async function listar(req, res) {
  const evento = await eventosService.buscarPorId(req.params.id, req.usuario); // 404 se não existir ou o perfil não puder ver
  const itens = await itensService.listar(evento.id);
  res.json(req.usuario.perfil === "fornecedor" ? itens.map(itensService.paraFornecedor) : itens);
}

// Substitui a composição de custos inteira pela lista enviada (ver itensService.sincronizar).
// Aceita a lista direto no corpo ou como { "itens": [...] }.
export async function substituir(req, res) {
  const eventoId = validarId(req.params.id);
  const itens = itensService.validarItens(Array.isArray(req.body) ? req.body : req.body?.itens);
  await eventosService.garantirDono(req.usuario.id, eventoId);

  await emTransacao((conexao) => itensService.sincronizar(conexao, eventoId, itens));
  res.json(await itensService.listar(eventoId));
}
