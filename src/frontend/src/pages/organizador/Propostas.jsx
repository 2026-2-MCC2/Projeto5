import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowRight, ArrowUpDown, Check, FileDown, Inbox, Star, Trophy } from "lucide-react";
import { Badge, Btn, CabecalhoModal, Chip, Estrelas, Icone, ListaDetalhes, Modal, TextoComIcone, TituloPagina, Valor, Vazio } from "../../components/ui";
import "../../components/organizador.css";
// Ainda sem API de propostas: usa os dados de exemplo do localStorage.
import { buscarEvento, salvarSelecao } from "../../services/mock/organizadorMock";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { moeda } from "../../utils/formatar";

const TODAS = "Todos";
const filtros = [TODAS, ...CATEGORIAS_FORNECEDOR];

const ordenacoes = {
  "Recomendados (Custo-Benefício)": (a, b) => Number(Boolean(b.recomendado)) - Number(Boolean(a.recomendado)) || b.nota - a.nota,
  "Menor preço": (a, b) => a.valor - b.valor,
  "Maior avaliação": (a, b) => b.nota - a.nota,
  "Mais avaliações": (a, b) => b.avaliacoes - a.avaliacoes,
};

// Agrupa as propostas por categoria, mantendo a ordem escolhida dentro de cada grupo.
function agruparPorCategoria(propostas) {
  const grupos = new Map();
  for (const p of propostas) {
    if (!grupos.has(p.categoria)) grupos.set(p.categoria, []);
    grupos.get(p.categoria).push(p);
  }
  return [...grupos.entries()].map(([categoria, lista]) => {
    const valores = lista.map((p) => p.valor);
    return { categoria, lista, menor: Math.min(...valores), maior: Math.max(...valores) };
  });
}

// Quanto a proposta custa a mais que o melhor preço do grupo: "R$ 570 a mais (+4,4%)".
function diferenca(valor, menor) {
  const acima = valor - menor;
  if (acima === 0) return "Empata com o melhor preço";
  const pct = ((acima / menor) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${moeda(acima)} a mais (+${pct}%)`;
}

export default function Propostas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEvento(Number(id));
  const [filtro, setFiltro] = useState(TODAS);
  const [ordem, setOrdem] = useState(Object.keys(ordenacoes)[0]);
  const [mostrarOrdem, setMostrarOrdem] = useState(false);
  const [selecionadas, setSelecionadas] = useState(() => evento?.selecionadas ?? []);
  const [aberta, setAberta] = useState(null);

  if (!evento) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/organizador" rotuloVoltar="Ver meus eventos" />;

  const visiveis = evento.propostas.filter((p) => filtro === TODAS || p.categoria === filtro).sort(ordenacoes[ordem]);
  const total = evento.propostas.filter((p) => selecionadas.includes(p.id)).reduce((soma, p) => soma + p.valor, 0);
  const grupos = agruparPorCategoria(visiveis);

  // Só uma proposta por categoria: escolher outra da mesma categoria troca a anterior.
  function alternar(proposta) {
    setSelecionadas((atuais) => {
      if (atuais.includes(proposta.id)) return atuais.filter((x) => x !== proposta.id);
      const outrasCategorias = atuais.filter((x) => evento.propostas.find((p) => p.id === x).categoria !== proposta.categoria);
      return [...outrasCategorias, proposta.id];
    });
  }

  function verResultado() {
    salvarSelecao(evento.id, selecionadas);
    navigate(`/organizador/eventos/${evento.id}/resultado`);
  }

  return (
    <>
      <TituloPagina titulo="Comparação de Propostas" sub={`${evento.propostas.length} propostas recebidas para ${evento.nome}`}>
        <Btn variante="ghost" tamanho="sm" icone={FileDown} onClick={() => window.print()}>
          Exportar PDF
        </Btn>
      </TituloPagina>

      <div className="tt-filtros" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }} role="group" aria-label="Filtrar por categoria">
          {filtros.map((f) => (
            <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <Btn variante="secondary" tamanho="sm" icone={ArrowUpDown} onClick={() => setMostrarOrdem(!mostrarOrdem)}>
            {ordem.split("(")[0].trim()}
          </Btn>
          {mostrarOrdem && (
            <div
              onMouseLeave={() => setMostrarOrdem(false)}
              style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--superficie)", border: "1px solid var(--borda)", borderRadius: "var(--raio-md)", overflow: "hidden", zIndex: 30, minWidth: "240px", boxShadow: "var(--sombra-2)" }}
            >
              {Object.keys(ordenacoes).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    setOrdem(o);
                    setMostrarOrdem(false);
                  }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", background: ordem === o ? "var(--ativo-fundo)" : "transparent", border: "none", color: ordem === o ? "var(--ativo-texto)" : "var(--texto-2)", fontSize: "var(--tam-sm)", cursor: "pointer" }}
                >
                  {o}
                  {ordem === o && <Icone icone={Check} tamanho={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {grupos.length === 0 ? (
        <Vazio
          icone={Inbox}
          titulo={evento.propostas.length ? "Nenhuma proposta nesta categoria" : "Nenhuma proposta recebida"}
          texto={evento.propostas.length ? "Escolha outra categoria para ver as propostas." : "Assim que os fornecedores enviarem propostas, elas aparecem aqui para comparar."}
        >
          {evento.propostas.length > 0 && (
            <Btn variante="secondary" onClick={() => setFiltro(TODAS)}>
              Ver todas as categorias
            </Btn>
          )}
        </Vazio>
      ) : (
        grupos.map((g) => (
          <section key={g.categoria} className="tt-grupo-propostas" aria-label={g.categoria}>
            <div className="tt-grupo-propostas__cabeca">
              <h3>{g.categoria}</h3>
              <span>
                {g.lista.length} {g.lista.length === 1 ? "proposta" : "propostas"}, melhor preço {moeda(g.menor)}
              </span>
            </div>

            {g.lista.map((p) => {
              const marcada = selecionadas.includes(p.id);
              // Melhor preço: a primeira proposta com o menor valor (empates mostram "Empata com o melhor preço").
              const melhor = g.lista.length > 1 && p === g.lista.find((x) => x.valor === g.menor);
              return (
                <div key={p.id} className={`tt-proposta${marcada ? " tt-proposta--marcada" : ""}${melhor ? " tt-proposta--melhor" : ""}`}>
                  <button type="button" className="tt-proposta__marcar" aria-pressed={marcada} aria-label={marcada ? `Desmarcar proposta de ${p.fornecedor}` : `Selecionar proposta de ${p.fornecedor}`} onClick={() => alternar(p)}>
                    {marcada && <Icone icone={Check} tamanho={14} strokeWidth={3} />}
                  </button>

                  <div>
                    <div className="tt-proposta__nome">
                      <strong>{p.fornecedor}</strong>
                      {melhor && (
                        <Badge variante="success">
                          <TextoComIcone icone={Trophy} tamanho={12} style={{ gap: 4 }}>
                            Melhor preço
                          </TextoComIcone>
                        </Badge>
                      )}
                      {p.recomendado && (
                        <Badge variante="info">
                          <TextoComIcone icone={Star} tamanho={12} style={{ gap: 4 }}>
                            Recomendado
                          </TextoComIcone>
                        </Badge>
                      )}
                    </div>
                    <div className="tt-proposta__avaliacao">
                      <Estrelas nota={p.nota} />
                      <span>{p.avaliacoes} avaliações</span>
                    </div>
                  </div>

                  <div className="tt-proposta__preco">
                    <span className="tt-proposta__valor">{moeda(p.valor)}</span>
                    <span className="tt-proposta__diferenca">{melhor ? "Mais barata da categoria" : g.lista.length > 1 ? diferenca(p.valor, g.menor) : "Única proposta da categoria"}</span>
                    <div className="tt-proposta__barra" aria-hidden="true">
                      <span style={{ width: `${(p.valor / g.maior) * 100}%` }} />
                    </div>
                  </div>

                  <Btn variante="secondary" tamanho="sm" onClick={() => setAberta(p)}>
                    Ver proposta
                  </Btn>
                </div>
              );
            })}
          </section>
        ))
      )}

      <div className="tt-espaco-barra" />

      <div className="tt-barra-selecao">
        <div className="tt-barra-selecao__linha">
          <div className="tt-barra-selecao__resumo">
            <span>
              {selecionadas.length} {selecionadas.length === 1 ? "proposta selecionada" : "propostas selecionadas"}
            </span>
            <strong>{total > 0 ? moeda(total) : "Nenhuma ainda"}</strong>
          </div>
          <Btn tamanho="lg" onClick={verResultado} disabled={selecionadas.length === 0} iconeDepois={ArrowRight}>
            Ver Resultado da Composição
          </Btn>
        </div>
      </div>

      {aberta && (
        <Modal onClose={() => setAberta(null)}>
          <CabecalhoModal onFechar={() => setAberta(null)}>
            <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: 4 }}>{aberta.fornecedor}</h3>
            <Estrelas nota={aberta.nota} />
          </CabecalhoModal>
          <ListaDetalhes itens={aberta.itens.map((item) => ({ rotulo: `${item.descricao} (${item.quantidade} ${item.unidade})`, valor: moeda(item.preco) }))} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--esp-3) var(--esp-4)", background: "var(--sucesso-fundo)", border: "1px solid var(--ok-borda)", borderRadius: "var(--raio-md)", marginBottom: "var(--esp-5)" }}>
            <span style={{ fontWeight: 600, color: "var(--texto-2)" }}>Total</span>
            <Valor tamanho="var(--tam-lg)" peso={700}>
              {moeda(aberta.valor)}
            </Valor>
          </div>
          <Btn
            style={{ width: "100%" }}
            icone={selecionadas.includes(aberta.id) ? Check : undefined}
            variante={selecionadas.includes(aberta.id) ? "secondary" : "primary"}
            onClick={() => {
              alternar(aberta);
              setAberta(null);
            }}
          >
            {selecionadas.includes(aberta.id) ? "Selecionada (clique para desmarcar)" : "Selecionar esta proposta"}
          </Btn>
        </Modal>
      )}
    </>
  );
}
