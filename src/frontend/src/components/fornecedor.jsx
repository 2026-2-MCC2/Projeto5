// Peças visuais das telas do fornecedor. Usa o mesmo cartão de ingresso do organizador (organizador.css).
import { Building2, Calendar, CircleCheck, MapPin, Megaphone, Users } from "lucide-react";
import { Badge, Esqueleto, Icone, Picote, TextoComIcone } from "./ui";
import { dataCurta, moeda } from "../utils/formatar";
import "./organizador.css";

const faixaPublico = (min, max) => `${Number(min).toLocaleString("pt-BR")}–${Number(max).toLocaleString("pt-BR")} pessoas`;

// Evento aberto para cotação (dados de GET /eventos).
// `destaque`: categoria do filtro escolhido, marcada entre as necessidades.
// `itensEnviados`: quantos itens deste evento já têm proposta do fornecedor (muda a faixa do topo).
export function CartaoOportunidade({ evento, destaque, itensEnviados = 0, acao }) {
  const enviada = itensEnviados > 0;
  return (
    <article className={`tt-cartao-evento ${enviada ? "tt-cartao-evento--success" : "tt-cartao-evento--info"}`}>
      <div className="tt-cartao-evento__faixa">
        <Icone icone={enviada ? CircleCheck : Megaphone} tamanho={18} />
        <div>
          <strong>{enviada ? "Proposta enviada" : "Aberto para cotação"}</strong>
          <span>{enviada ? `Você cotou ${itensEnviados} ${itensEnviados === 1 ? "item" : "itens"} deste evento` : "Recebendo propostas dos fornecedores"}</span>
        </div>
      </div>

      <div className="tt-cartao-evento__corpo">
        <div className="tt-cartao-evento__titulo">
          <h3>{evento.nome}</h3>
          {evento.categoria && <Badge>{evento.categoria}</Badge>}
        </div>
        <div className="tt-cartao-evento__meta">
          <TextoComIcone icone={Calendar}>{dataCurta(evento.data_inicio)}</TextoComIcone>
          <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
          <TextoComIcone icone={Users}>{faixaPublico(evento.publico_minimo, evento.publico_maximo)}</TextoComIcone>
          {evento.organizador_nome && <TextoComIcone icone={Building2}>{evento.organizador_nome}</TextoComIcone>}
        </div>
        {evento.categorias_itens?.length > 0 && (
          <div className="tt-necessidades" aria-label="O que o evento precisa contratar">
            {evento.categorias_itens.map((n) => (
              <span key={n} className={n === destaque ? "tt-necessidades__item tt-necessidades__item--ativo" : "tt-necessidades__item"}>
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      <Picote />

      <div className="tt-cartao-evento__rodape">
        <dl>
          <div>
            <dt>Orçamento estimado</dt>
            <dd>{moeda(evento.orcamento ?? 0)}</dd>
          </div>
        </dl>
        {acao && <div className="tt-cartao-evento__acoes">{acao}</div>}
      </div>
    </article>
  );
}

export function EsqueletoOportunidade() {
  return (
    <div className="tt-cartao-evento tt-cartao-evento--esqueleto" aria-hidden="true">
      <div className="tt-cartao-evento__faixa">
        <Esqueleto largura="45%" altura="14px" />
      </div>
      <div className="tt-cartao-evento__corpo">
        <Esqueleto largura="70%" altura="20px" style={{ marginBottom: 14 }} />
        <Esqueleto largura="50%" />
        <Esqueleto largura="60%" style={{ marginTop: 8 }} />
        <Esqueleto largura="40%" style={{ marginTop: 8 }} />
      </div>
      <Picote />
      <div className="tt-cartao-evento__rodape">
        <Esqueleto largura="40%" altura="28px" />
        <Esqueleto largura="130px" altura="32px" raio="8px" />
      </div>
    </div>
  );
}
