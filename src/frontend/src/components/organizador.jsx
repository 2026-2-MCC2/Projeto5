// Peças visuais das telas do organizador (cartão de evento, ticket estimado, etapas, skeletons).
// Só aparência: os dados chegam prontos das páginas.
import { Ban, Calendar, CalendarClock, Check, CircleCheck, FilePen, MapPin, Megaphone, Ticket, Users } from "lucide-react";
import { Badge, Esqueleto, Icone, Picote, TextoComIcone } from "./ui";
import { ROTULO_STATUS_EVENTO } from "../data/statusEvento";
import { dataCurta, moeda } from "../utils/formatar";
import { cenariosTicket, moedaCentavos } from "../utils/ticket";
import "./organizador.css";

// Cor, ícone e explicação curta de cada status de evento.
const META_STATUS = {
  rascunho: { variante: "neutral", icone: FilePen, texto: "Ainda não visível para fornecedores" },
  em_andamento: { variante: "info", icone: Megaphone, texto: "Recebendo propostas" },
  aguardando_data: { variante: "warning", icone: CalendarClock, texto: "Custos fechados, aguardando a data" },
  concluido: { variante: "success", icone: CircleCheck, texto: "Evento realizado" },
  cancelado: { variante: "error", icone: Ban, texto: "Evento cancelado" },
};

const metaDe = (status) => META_STATUS[status] ?? META_STATUS.rascunho;

const faixaPublico = (min, max) =>
  min && max ? `${Number(min).toLocaleString("pt-BR")}–${Number(max).toLocaleString("pt-BR")} pessoas` : "Público a definir";

// Selo grande de status (cabeçalho de detalhes).
export function SeloStatus({ status }) {
  const meta = metaDe(status);
  return (
    <span className={`tt-selo-status tt-badge--${meta.variante}`}>
      <Icone icone={meta.icone} tamanho={16} />
      {ROTULO_STATUS_EVENTO[status] ?? status}
    </span>
  );
}

// Cartão de evento em forma de ingresso: faixa de status no topo, dados, picote e números.
// `acoes` aparece no rodapé, à direita.
export function CartaoEvento({ evento, acoes, onAbrir }) {
  const meta = metaDe(evento.status);
  return (
    <article className={`tt-cartao-evento tt-cartao-evento--${meta.variante}`}>
      <div className="tt-cartao-evento__faixa">
        <Icone icone={meta.icone} tamanho={18} />
        <div>
          <strong>{ROTULO_STATUS_EVENTO[evento.status] ?? evento.status}</strong>
          <span>{meta.texto}</span>
        </div>
      </div>

      <div className="tt-cartao-evento__corpo">
        <div className="tt-cartao-evento__titulo">
          <h3>
            {onAbrir ? (
              <button type="button" onClick={onAbrir}>
                {evento.nome || "Evento sem nome"}
              </button>
            ) : (
              evento.nome || "Evento sem nome"
            )}
          </h3>
          {evento.categoria && <Badge>{evento.categoria}</Badge>}
        </div>
        <div className="tt-cartao-evento__meta">
          <TextoComIcone icone={Calendar}>{evento.data_inicio ? dataCurta(evento.data_inicio) : "Data a definir"}</TextoComIcone>
          <TextoComIcone icone={MapPin}>{evento.local || "Local a definir"}</TextoComIcone>
          <TextoComIcone icone={Users}>{faixaPublico(evento.publico_minimo, evento.publico_maximo)}</TextoComIcone>
        </div>
      </div>

      <Picote />

      <div className="tt-cartao-evento__rodape">
        <dl>
          <div>
            <dt>Orçamento</dt>
            <dd>{moeda(evento.orcamento ?? 0)}</dd>
          </div>
          <div>
            <dt>Propostas</dt>
            <dd className={evento.total_propostas > 0 ? "tt-cartao-evento__destaque" : undefined}>{evento.total_propostas ?? 0}</dd>
          </div>
        </dl>
        {acoes && <div className="tt-cartao-evento__acoes">{acoes}</div>}
      </div>
    </article>
  );
}

export function EsqueletoCartaoEvento() {
  return (
    <div className="tt-cartao-evento tt-cartao-evento--esqueleto" aria-hidden="true">
      <div className="tt-cartao-evento__faixa">
        <Esqueleto largura="40%" altura="14px" />
      </div>
      <div className="tt-cartao-evento__corpo">
        <Esqueleto largura="75%" altura="20px" style={{ marginBottom: 14 }} />
        <Esqueleto largura="55%" />
        <Esqueleto largura="65%" style={{ marginTop: 8 }} />
      </div>
      <Picote />
      <div className="tt-cartao-evento__rodape">
        <Esqueleto largura="45%" altura="28px" />
        <Esqueleto largura="90px" altura="32px" raio="8px" />
      </div>
    </div>
  );
}

// Ticket estimado com os cenários de público mínimo e máximo.
// `custo`: total usado na conta; `rotuloCusto` diz de onde ele vem (acordado ou estimado).
export function TicketCenarios({ custo, rotuloCusto, publicoMinimo, publicoMaximo, margem, nota }) {
  const cenarios = cenariosTicket({ custo, publicoMinimo, publicoMaximo, margem });

  return (
    <section className="tt-ticket-estimado" aria-label="Ticket estimado">
      <header className="tt-ticket-estimado__topo">
        <span className="tt-ticket-estimado__icone">
          <Icone icone={Ticket} tamanho={20} />
        </span>
        <div>
          <h3>Ticket estimado</h3>
          <p>
            {rotuloCusto} de <strong>{moeda(custo)}</strong> com margem de <strong>{Math.round(margem * 100)}%</strong> sobre o preço.
          </p>
        </div>
      </header>

      <Picote />

      {cenarios ? (
        <>
          <div className="tt-ticket-estimado__cenarios">
            {[cenarios.minimo, cenarios.maximo].map((c) => (
              <div key={c.rotulo} className="tt-ticket-estimado__cenario">
                <span className="tt-ticket-estimado__rotulo">{c.rotulo}</span>
                <span className="tt-ticket-estimado__publico">
                  <Icone icone={Users} tamanho={14} />
                  {c.publico.toLocaleString("pt-BR")} pessoas
                </span>
                <strong className="tt-ticket-estimado__preco">{moedaCentavos(c.preco)}</strong>
                <span className="tt-ticket-estimado__por">por ingresso</span>
                <dl>
                  <div>
                    <dt>Custo por pessoa</dt>
                    <dd>{moedaCentavos(c.custoPorPessoa)}</dd>
                  </div>
                  <div>
                    <dt>Lucro por ingresso</dt>
                    <dd>{moedaCentavos(c.lucroPorIngresso)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          <footer className="tt-ticket-estimado__rodape">
            <Icone icone={Check} tamanho={16} />
            Nos dois cenários a receita prevista é de {moedaCentavos(cenarios.receita)}, com lucro de {moedaCentavos(cenarios.lucro)}.
            {nota && <span className="tt-ticket-estimado__nota">{nota}</span>}
          </footer>
        </>
      ) : (
        <p className="tt-ticket-estimado__vazio">Cadastre os custos e o público do evento para estimar o preço do ingresso.</p>
      )}
    </section>
  );
}

export function EsqueletoTicket() {
  return (
    <div className="tt-ticket-estimado" aria-hidden="true">
      <div className="tt-ticket-estimado__topo">
        <Esqueleto largura="40px" altura="40px" raio="10px" />
        <div style={{ flex: 1 }}>
          <Esqueleto largura="35%" altura="18px" style={{ marginBottom: 8 }} />
          <Esqueleto largura="70%" />
        </div>
      </div>
      <Picote />
      <div className="tt-ticket-estimado__cenarios">
        {[0, 1].map((i) => (
          <div key={i} className="tt-ticket-estimado__cenario">
            <Esqueleto largura="60%" style={{ marginBottom: 10 }} />
            <Esqueleto largura="50%" altura="32px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Indicador de etapas de um formulário. `etapas`: lista de rótulos; `feitas`: índices concluídos.
export function Etapas({ etapas, atual, feitas = [], onIr }) {
  return (
    <ol className="tt-etapas">
      {etapas.map((rotulo, i) => {
        const feita = feitas.includes(i) && i !== atual;
        return (
          <li key={rotulo} className={`tt-etapas__item${i === atual ? " tt-etapas__item--atual" : ""}${feita ? " tt-etapas__item--feita" : ""}`}>
            <button type="button" onClick={() => onIr(i)} aria-current={i === atual ? "step" : undefined}>
              <span className="tt-etapas__numero">{feita ? <Icone icone={Check} tamanho={14} /> : i + 1}</span>
              <span className="tt-etapas__rotulo">{rotulo}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
