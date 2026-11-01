// Peças visuais das telas do fornecedor. Usa o mesmo cartão de ingresso do organizador (organizador.css).
import { Calendar, MapPin, Megaphone, Users } from "lucide-react";
import { Badge, Icone, Picote, TextoComIcone } from "./ui";
import { dataCurta, faixaMoeda } from "../utils/formatar";
import "./organizador.css";

// Evento aberto para cotação. `destaque` marca a necessidade que bate com o filtro escolhido.
export function CartaoOportunidade({ evento, destaque, acao }) {
  return (
    <article className="tt-cartao-evento tt-cartao-evento--info">
      <div className="tt-cartao-evento__faixa">
        <Icone icone={Megaphone} tamanho={18} />
        <div>
          <strong>Aberto para cotação</strong>
          <span>Envie sua proposta até {dataCurta(evento.prazo)}</span>
        </div>
      </div>

      <div className="tt-cartao-evento__corpo">
        <div className="tt-cartao-evento__titulo">
          <h3>{evento.nome}</h3>
          <Badge>{evento.categoria}</Badge>
        </div>
        <div className="tt-cartao-evento__meta">
          <TextoComIcone icone={Calendar}>{dataCurta(evento.data)}</TextoComIcone>
          <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
          <TextoComIcone icone={Users}>{evento.convidados.toLocaleString("pt-BR")} convidados</TextoComIcone>
        </div>
        <div className="tt-necessidades" aria-label="O que o evento procura">
          {evento.necessidades.map((n) => (
            <span key={n} className={n === destaque ? "tt-necessidades__item tt-necessidades__item--ativo" : "tt-necessidades__item"}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <Picote />

      <div className="tt-cartao-evento__rodape">
        <dl>
          <div>
            <dt>Orçamento do organizador</dt>
            <dd>{faixaMoeda(evento.orcamento)}</dd>
          </div>
        </dl>
        {acao && <div className="tt-cartao-evento__acoes">{acao}</div>}
      </div>
    </article>
  );
}
