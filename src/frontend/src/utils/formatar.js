const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const doisDigitos = (n) => String(n).padStart(2, "0");

// As datas ficam salvas como "AAAA-MM-DD" (ou "AAAA-MM-DD HH:MM:SS", vindo da API)
// e são lidas como texto para evitar problemas de fuso horário.
function partes(iso) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  const [hora = 0, min = 0] = (iso.slice(11, 16) || "").split(":").map(Number);
  return { ano, mes, dia, hora, min };
}

export const moeda = (valor) => `R$ ${valor.toLocaleString("pt-BR")}`;

export const faixaMoeda = ({ min, max }) => `${moeda(min)}–${max.toLocaleString("pt-BR")}`;

// "2025-03-15" -> "15 Mar 2025"
export function dataCurta(iso) {
  const { ano, mes, dia } = partes(iso);
  return `${doisDigitos(dia)} ${MESES[mes - 1]} ${ano}`;
}

// "2026-12-12 11:00:00" -> "12 Dez 2026, 11:00"
export function dataHora(iso) {
  const { hora, min } = partes(iso);
  return `${dataCurta(iso)}, ${doisDigitos(hora)}:${doisDigitos(min)}`;
}

// Início e fim de um evento: "12 Dez 2026, 11:00 – 22:00" no mesmo dia, ou as duas datas completas.
export function periodo(inicio, fim) {
  if (!fim) return dataHora(inicio);
  if (inicio.slice(0, 10) === fim.slice(0, 10)) return `${dataHora(inicio)} – ${fim.slice(11, 16)}`;
  return `${dataHora(inicio)} – ${dataHora(fim)}`;
}

// "2026-12-12 11:00:00" (API) <-> "2026-12-12T11:00" (campo datetime-local)
export const paraCampoDataHora = (iso) => (iso ? iso.slice(0, 16).replace(" ", "T") : "");

// 0.25 -> "25%"
export const porcentagem = (fracao) => `${Math.round(fracao * 100)}%`;

// "2024-12-01" -> "Dez 2024"
export function mesAno(iso) {
  const { ano, mes } = partes(iso);
  return `${MESES[mes - 1]} ${ano}`;
}

// Data de daqui a `dias` dias, como "AAAA-MM-DD" no horário local.
export function diasAFrenteIso(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export const hojeIso = () => diasAFrenteIso(0);

const UM_DIA = 24 * 60 * 60 * 1000;

// Timestamp -> "hoje", "há 1 dia", "há 5 dias"
export function tempoDesde(timestamp) {
  const dias = Math.floor((Date.now() - timestamp) / UM_DIA);
  if (dias === 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

// O timestamp está dentro dos últimos `dias` dias? Sem `dias`, vale qualquer data.
export function dentroDosUltimos(timestamp, dias) {
  if (dias === undefined) return true;
  return timestamp !== undefined && Date.now() - timestamp <= dias * UM_DIA;
}
