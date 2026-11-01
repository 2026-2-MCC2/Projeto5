import { paraCampoDataHora } from "./formatar";

// Conversões e validações do formulário de evento (components/FormularioEvento.jsx).

// Valores do formulário (tudo texto, como os inputs guardam).
export function formularioVazio() {
  return { nome: "", descricao: "", data_inicio: "", data_fim: "", local: "", publico_minimo: "", publico_maximo: "", margem: "", categoria: null, status: "rascunho" };
}

// Evento da API -> formulário (para editar).
export function formularioDoEvento(ev) {
  return {
    nome: ev.nome,
    descricao: ev.descricao ?? "",
    data_inicio: paraCampoDataHora(ev.data_inicio),
    data_fim: paraCampoDataHora(ev.data_fim),
    local: ev.local,
    publico_minimo: String(ev.publico_minimo),
    publico_maximo: String(ev.publico_maximo),
    margem: String(Math.round(ev.margem_lucro * 100)), // fração -> %
    categoria: ev.categoria,
    status: ev.status,
  };
}

// Formulário -> corpo para a API. A margem é digitada em % e vai como fração (25 -> 0.25).
export function eventoDoFormulario(f) {
  return {
    nome: f.nome.trim(),
    descricao: f.descricao.trim() || null,
    categoria: f.categoria,
    data_inicio: f.data_inicio,
    data_fim: f.data_fim,
    local: f.local.trim(),
    publico_minimo: Number(f.publico_minimo),
    publico_maximo: Number(f.publico_maximo),
    margem_lucro: f.margem === "" ? 0 : Number(f.margem) / 100,
    status: f.status,
  };
}

// Mesmas regras da API, para avisar antes de enviar. Devolve a lista de problemas.
export function problemasDoFormulario(f) {
  const problemas = [];
  if (!f.nome.trim()) problemas.push("Informe o nome do evento.");
  if (!f.data_inicio || !f.data_fim) problemas.push("Informe a data e hora de início e de término.");
  else if (f.data_fim < f.data_inicio) problemas.push("O término não pode ser antes do início.");
  if (!f.local.trim()) problemas.push("Informe o local do evento.");

  const min = Number(f.publico_minimo);
  const max = Number(f.publico_maximo);
  if (!f.publico_minimo || !f.publico_maximo) problemas.push("Informe o público mínimo e o máximo.");
  else if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < 1) problemas.push("O público deve ser um número inteiro maior que zero.");
  else if (min > max) problemas.push("O público mínimo não pode ser maior que o máximo.");

  const margem = Number(f.margem);
  if (f.margem !== "" && (!Number.isFinite(margem) || margem < 0 || margem > 99)) problemas.push("A margem de lucro deve ficar entre 0% e 99%.");
  return problemas;
}
