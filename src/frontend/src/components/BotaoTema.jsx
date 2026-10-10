import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Icone } from "./ui";

const CHAVE = "tema";

// Botão redondo fixo no canto inferior direito que liga e desliga o tema escuro.
// O tema inicial é aplicado no index.html, antes do React carregar, para a tela não piscar.
export default function BotaoTema() {
  const [escuro, setEscuro] = useState(() => document.documentElement.dataset.tema === "escuro");

  useEffect(() => {
    document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
    try {
      localStorage.setItem(CHAVE, escuro ? "escuro" : "claro");
    } catch {
      // Sem acesso ao armazenamento (ex.: navegação privada): o tema vale só nesta visita.
    }
  }, [escuro]);

  const rotulo = escuro ? "Desativar tema escuro" : "Ativar tema escuro";

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
