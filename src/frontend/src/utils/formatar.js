const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const doisDigitos = (n) => String(n).padStart(2, "0");

// As datas ficam salvas como "AAAA-MM-DD" para evitar problemas de fuso horário.
function partes(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return { ano, mes, dia };
}

export const moeda = (valor) => `R$ ${valor.toLocaleString("pt-BR")}`;

export const faixaMoeda = ({ min, max }) => `${moeda(min)}–${max.toLocaleString("pt-BR")}`;

// "2025-03-15" -> "15 Mar 2025"
export function dataCurta(iso) {
  const { ano, mes, dia } = partes(iso);
  return `${doisDigitos(dia)} ${MESES[mes - 1]} ${ano}`;
}

// "2024-12-01" -> "Dez 2024"
export function mesAno(iso) {
  const { ano, mes } = partes(iso);
  return `${MESES[mes - 1]} ${ano}`;
}

export function hojeIso() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(hoje.getDate())}`;
}

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
