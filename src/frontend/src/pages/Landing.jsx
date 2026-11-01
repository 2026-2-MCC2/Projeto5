import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarDays, Check, ClipboardList, FileText, Menu, Scale, Star, TrendingDown, Users, X } from "lucide-react";
import { Badge, Estrelas, Icone, MarcaLogo, Picote } from "../components/ui";
import fotoShow from "../assets/troca_ticket.jpg";
import logotipo from "../assets/logotipo_troca_ticket.png";
import "./Landing.css";

const ANO = new Date().getFullYear();

const links = [
  { rotulo: "Como funciona", id: "como-funciona" },
  { rotulo: "Para organizadores", id: "organizadores" },
  { rotulo: "Para fornecedores", id: "fornecedores" },
];

// Exemplo usado nas ilustrações da página (hero e "Como funciona").
const itensExemplo = [
  { item: "Sonorização", estimado: "R$ 8.500", acordado: "R$ 7.650" },
  { item: "Buffet para 200 pessoas", estimado: "R$ 14.000", acordado: "R$ 12.880" },
  { item: "Iluminação de palco", estimado: "R$ 6.200", acordado: "R$ 5.900" },
  { item: "Segurança", estimado: "R$ 4.800", acordado: "R$ 4.320" },
];

const propostasExemplo = [
  { fornecedor: "Sabor & Cia Buffet", valor: "R$ 12.880", nota: 4.8, melhor: true },
  { fornecedor: "Casa Nobre Eventos", valor: "R$ 13.450", nota: 4.6 },
  { fornecedor: "Delícias SP", valor: "R$ 14.200", nota: 4.2 },
];

const passos = [
  {
    perfil: "Organizador",
    titulo: "Publique o evento e o que precisa contratar",
    texto: "Cadastre data, local e público, e liste cada item com o valor que você estima gastar.",
  },
  {
    perfil: "Fornecedores",
    titulo: "Receba propostas item por item",
    texto: "Fornecedores aprovados veem a oportunidade e enviam o preço que conseguem oferecer.",
  },
  {
    perfil: "Acordo fechado",
    titulo: "Compare, escolha e feche o ticket",
    texto: "Selecione a melhor proposta de cada item e veja o total acordado e quanto economizou.",
  },
];

const beneficiosOrganizador = [
  { icone: ClipboardList, titulo: "Orçamento organizado", texto: "Todos os itens do evento numa lista só, com estimado e acordado lado a lado." },
  { icone: Scale, titulo: "Comparação justa", texto: "Propostas do mesmo item uma ao lado da outra, com a nota de cada fornecedor." },
  { icone: TrendingDown, titulo: "Economia visível", texto: "O resultado mostra o total acordado e a diferença para o que você estimou." },
];

const beneficiosFornecedor = [
  { icone: CalendarDays, titulo: "Oportunidades abertas", texto: "Eventos em cotação com os itens que você fornece, prontos para receber proposta." },
  { icone: FileText, titulo: "Propostas acompanhadas", texto: "Veja quais propostas estão em análise, foram selecionadas ou recusadas." },
  { icone: Star, titulo: "Reputação que conta", texto: "As avaliações dos organizadores formam sua nota e ajudam a ganhar os próximos eventos." },
];

// Canhoto do acordo fechado: o "ticket" que dá nome ao produto.
function TicketAcordo({ compacto = false }) {
  return (
    <div className={`tt-ticket${compacto ? " tt-ticket--compacto" : ""}`}>
      <div className="tt-ticket__topo">
        <div>
          <span className="tt-ticket__legenda">Semana Acadêmica 2026</span>
          <strong className="tt-ticket__titulo">Acordo fechado</strong>
        </div>
        <Badge variante="success">4 de 4 itens</Badge>
      </div>

      {!compacto && (
        <ul className="tt-ticket__itens">
          {itensExemplo.map((i) => (
            <li key={i.item}>
              <span>{i.item}</span>
              <span className="tt-ticket__valor">{i.acordado}</span>
            </li>
          ))}
        </ul>
      )}

      <Picote fundo="var(--ticket-recorte)" />

      <div className="tt-ticket__total">
        <div>
          <span className="tt-ticket__legenda">Total acordado</span>
          <strong className="tt-ticket__valor tt-ticket__valor--grande">R$ 30.750,00</strong>
        </div>
        <div className="tt-ticket__economia">
          <Icone icone={TrendingDown} tamanho={16} />
          R$ 2.750 abaixo do estimado
        </div>
      </div>
    </div>
  );
}

// Ilustração de cada passo do "Como funciona".
function IlustracaoPasso({ indice }) {
  if (indice === 0) {
    return (
      <ul className="tt-mini tt-mini--lista">
        {itensExemplo.map((i) => (
          <li key={i.item}>
            <span>{i.item}</span>
            <span className="tt-ticket__valor">{i.estimado}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (indice === 1) {
    return (
      <ul className="tt-mini tt-mini--propostas">
        {propostasExemplo.map((p) => (
          <li key={p.fornecedor} className={p.melhor ? "tt-mini__melhor" : undefined}>
            <div>
              <strong>{p.fornecedor}</strong>
              <Estrelas nota={p.nota} />
            </div>
            <span className="tt-ticket__valor">{p.valor}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <TicketAcordo compacto />;
}

function ListaBeneficios({ itens }) {
  return (
    <ul className="tt-beneficios__lista">
      {itens.map((b) => (
        <li key={b.titulo}>
          <span className="tt-beneficios__icone">
            <Icone icone={b.icone} tamanho={20} />
          </span>
          <div>
            <h4>{b.titulo}</h4>
            <p>{b.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function LandingView() {
  const navigate = useNavigate();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  // O cabeçalho fica transparente sobre a foto do hero e ganha fundo depois de rolar.
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e) => e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  const irPara = (rota) => {
    setMenuAberto(false);
    navigate(rota);
  };

  return (
    <div className="tt-landing">
      {/* ── Cabeçalho ── */}
      <header className={`tt-l-topo${rolou || menuAberto ? " tt-l-topo--solido" : ""}`}>
        <div className="tt-l-container tt-l-topo__linha">
          <a href="#inicio" className="tt-l-marca" onClick={() => setMenuAberto(false)}>
            <MarcaLogo tamanho={30} />
            TrocaTicket
          </a>

          <nav className="tt-l-nav" aria-label="Seções da página">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`}>
                {l.rotulo}
              </a>
            ))}
          </nav>

          <div className="tt-l-topo__acoes">
            <button type="button" className="tt-l-entrar" onClick={() => irPara("/login")}>
              Entrar
            </button>
            <button type="button" className="tt-btn tt-btn--primary tt-btn--md" onClick={() => irPara("/criar-conta")}>
              Criar conta
            </button>
            <button
              type="button"
              className="tt-l-menu"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              aria-controls="menu-landing"
            >
              <Icone icone={menuAberto ? X : Menu} tamanho={22} />
            </button>
          </div>
        </div>

        {menuAberto && (
          <div id="menu-landing" className="tt-l-gaveta">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuAberto(false)}>
                {l.rotulo}
              </a>
            ))}
            <div className="tt-l-gaveta__acoes">
              <button type="button" className="tt-btn tt-btn--secondary tt-btn--lg" onClick={() => irPara("/login")}>
                Entrar
              </button>
              <button type="button" className="tt-btn tt-btn--primary tt-btn--lg" onClick={() => irPara("/criar-conta")}>
                Criar conta
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ── */}
        <section id="inicio" className="tt-hero">
          <img className="tt-hero__foto" src={fotoShow} alt="" aria-hidden="true" />
          <div className="tt-hero__veu" aria-hidden="true" />

          <div className="tt-l-container tt-hero__grade">
            <div className="tt-hero__texto">
              <h1>Monte seu evento com as melhores propostas.</h1>
              <p>
                O organizador publica o que precisa contratar, fornecedores enviam suas propostas e o acordo fecha num só
                lugar, com cada valor registrado.
              </p>
              <div className="tt-hero__acoes">
                <button type="button" className="tt-btn tt-btn--primary tt-btn--lg" onClick={() => navigate("/criar-conta")}>
                  Criar conta grátis
                  <Icone icone={ArrowRight} tamanho={18} />
                </button>
                <a href="#como-funciona" className="tt-btn tt-btn--lg tt-hero__secundario">
                  Ver como funciona
                </a>
              </div>
              <p className="tt-hero__nota">
                <Icone icone={BadgeCheck} tamanho={16} />
                Cadastros conferidos pela equipe TrocaTicket antes do primeiro acesso.
              </p>
            </div>

            <div className="tt-hero__ticket">
              <TicketAcordo />
            </div>
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section id="como-funciona" className="tt-l-secao">
          <div className="tt-l-container">
            <div className="tt-l-cabecalho">
              <h2>Do pedido ao acordo, em três passos</h2>
              <p>Cada evento passa pelo mesmo caminho: o organizador diz o que precisa, os fornecedores respondem e o acordo fica registrado.</p>
            </div>

            <ol className="tt-passos">
              {passos.map((p, i) => (
                <li key={p.titulo} className="tt-passo">
                  <div className="tt-passo__cabeca">
                    <span className="tt-passo__numero">{i + 1}</span>
                    <span className="tt-passo__perfil">{p.perfil}</span>
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                  <div className="tt-passo__ilustracao">
                    <IlustracaoPasso indice={i} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Benefícios por perfil ── */}
        <section className="tt-l-secao tt-l-secao--alternada">
          <div className="tt-l-container tt-beneficios">
            <article id="organizadores" className="tt-beneficios__perfil">
              <span className="tt-beneficios__selo tt-beneficios__selo--azul">
                <Icone icone={CalendarDays} tamanho={20} />
              </span>
              <h2>Para organizadores</h2>
              <p className="tt-beneficios__intro">Contrate tudo o que o evento precisa sem planilha solta e sem perder proposta no e-mail.</p>
              <ListaBeneficios itens={beneficiosOrganizador} />
              <button type="button" className="tt-btn tt-btn--primary tt-btn--lg" onClick={() => navigate("/criar-conta")}>
                Criar conta de organizador
              </button>
            </article>

            <article id="fornecedores" className="tt-beneficios__perfil">
              <span className="tt-beneficios__selo tt-beneficios__selo--laranja">
                <Icone icone={Users} tamanho={20} />
              </span>
              <h2>Para fornecedores</h2>
              <p className="tt-beneficios__intro">Encontre eventos que precisam do seu serviço e envie propostas direto para quem decide.</p>
              <ListaBeneficios itens={beneficiosFornecedor} />
              <button type="button" className="tt-btn tt-btn--accent tt-btn--lg" onClick={() => navigate("/criar-conta")}>
                Criar conta de fornecedor
              </button>
            </article>
          </div>
        </section>

        {/* ── Chamada final ── */}
        <section className="tt-l-secao">
          <div className="tt-l-container">
            <div className="tt-cta">
              <div className="tt-cta__texto">
                <h2>Seu próximo evento começa com uma lista de itens.</h2>
                <p>Crie sua conta gratuita. Assim que a equipe aprovar o cadastro, você já pode publicar eventos ou enviar propostas.</p>
                <ul>
                  {["Cadastro gratuito", "Aprovação pela equipe", "Organizadores e fornecedores"].map((t) => (
                    <li key={t}>
                      <Icone icone={Check} tamanho={16} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tt-cta__acoes">
                <button type="button" className="tt-btn tt-btn--primary tt-btn--lg" onClick={() => navigate("/criar-conta")}>
                  Criar conta grátis
                  <Icone icone={ArrowRight} tamanho={18} />
                </button>
                <button type="button" className="tt-btn tt-btn--lg tt-cta__entrar" onClick={() => navigate("/login")}>
                  Já tenho conta
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Rodapé ── */}
      <footer className="tt-l-rodape">
        <div className="tt-l-container tt-l-rodape__linha">
          <span className="tt-l-rodape__placa">
            <img src={logotipo} alt="TrocaTicket" />
          </span>
          <nav aria-label="Rodapé">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`}>
                {l.rotulo}
              </a>
            ))}
            <button type="button" onClick={() => navigate("/login")}>
              Entrar
            </button>
          </nav>
        </div>
        <div className="tt-l-container">
          <div className="tt-l-rodape__base">
            <span>© {ANO} TrocaTicket</span>
            <span>Projeto Interdisciplinar da FECAP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
