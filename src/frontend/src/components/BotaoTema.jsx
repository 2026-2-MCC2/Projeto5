import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Icone } from "./ui";

const CHAVE = "tema";

// Nas áreas logadas o botão de tema fica no menu lateral (variante "menu"),
// então o botão flutuante não aparece nelas.
const AREA_LOGADA = /^\/(organizador|fornecedor|admin)(\/|$)/;

// Liga e desliga o tema escuro.
// - variante "flutuante" (padrão): círculo fixo no canto inferior direito, nas telas públicas.
// - variante "menu": linha com chave liga/desliga, usada no rodapé do menu lateral (Layout).
// O tema inicial é aplicado no index.html, antes do React carregar, para a tela não piscar.
export default function BotaoTema({ variante = "flutuante" }) {
  const { pathname } = useLocation();
  const [escuro, setEscuro] = useState(() => document.documentElement.dataset.tema === "escuro");

  useEffect(() => {
    document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
    try {
      localStorage.setItem(CHAVE, escuro ? "escuro" : "claro");
    } catch {
      // Sem acesso ao armazenamento (ex.: navegação privada): o tema vale só nesta visita.
    }
  }, [escuro]);

  if (variante === "flutuante" && AREA_LOGADA.test(pathname)) return null;

  const rotulo = escuro ? "Desativar tema escuro" : "Ativar tema escuro";

  if (variante === "menu") {
    return (
      <button type="button" className="tt-tema-menu" onClick={() => setEscuro(!escuro)} role="switch" aria-checked={escuro}>
        <Icone icone={escuro ? Moon : Sun} />
        <span>Tema escuro</span>
        <span className="tt-tema-menu__chave" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="tt-botao-tema"
      onClick={() => setEscuro(!escuro)}
      aria-pressed={escuro}
      aria-label={rotulo}
      title={rotulo}
    >
      <Icone icone={escuro ? Sun : Moon} />
    </button>
  );
}
