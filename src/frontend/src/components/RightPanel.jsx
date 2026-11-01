import { Check } from "lucide-react";
import { Icone, Picote } from "./ui";
import "./RightPanel.css";

const ANO = new Date().getFullYear();

// Painel de apresentação ao lado dos formulários de Login e Criar conta.
// `features`: lista de { icon, title, desc }; `highlight`: { title, desc }, mostrado como um canhoto de ingresso.
// Em telas estreitas (até 959px) o painel não aparece, para o formulário ocupar a tela.
export default function RightPanel({ heading, sub, features, highlight }) {
  return (
    <aside className="tt-painel">
      <div className="tt-painel__conteudo">
        <h2 className="tt-painel__titulo">{heading}</h2>
        <p className="tt-painel__sub">{sub}</p>

        <ul className="tt-painel__lista">
          {features.map((f) => (
            <li key={f.title}>
              <Icone icone={f.icon} tamanho={20} />
              <div>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="tt-painel__canhoto">
          <div className="tt-painel__canhoto-topo">
            <span className="tt-painel__selo" aria-hidden="true">
              <Icone icone={Check} tamanho={16} />
            </span>
            <strong>{highlight.title}</strong>
          </div>
          <Picote fundo="var(--painel-fundo)" />
          <p>{highlight.desc}</p>
        </div>
      </div>

      <div className="tt-painel__rodape">
        <span>© {ANO} TrocaTicket</span>
        <div>
          <button type="button">Termos</button>
          <button type="button">Privacidade</button>
        </div>
      </div>
    </aside>
  );
}
