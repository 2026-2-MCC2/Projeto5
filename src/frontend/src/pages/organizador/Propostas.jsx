import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowRight, ArrowUpDown, Check, FileDown, Inbox, Lock, Trophy } from "lucide-react";
import { Aviso, Badge, Btn, Card, CabecalhoModal, Chip, Esqueleto, ErroCarregar, Icone, ListaDetalhes, Modal, StatusBadge, TextoComIcone, TituloPagina, Valor, Vazio } from "../../components/ui";
import "../../components/organizador.css";
import { buscarEvento, listarPropostas, salvarSelecao } from "../../services/organizadorService";
import { dataCurta, moeda } from "../../utils/formatar";

const TODAS = "Todos";

const ordenacoes = {
  "Menor preço": (a, b) => a.valor - b.valor,
  "Mais recentes": (a, b) => b.criado_em.localeCompare(a.criado_em),
};

const ROTULO_STATUS_PROPOSTA = { em_analise: "Em análise", selecionada: "Aprovada", recusada: "Rejeitada" };

// Agrupa as propostas por item de custo, mantendo a ordem escolhida dentro de cada grupo.
function agruparPorItem(propostas) {
  const grupos = new Map();
  for (const p of propostas) {
    if (!grupos.has(p.item_id)) {
      grupos.set(p.item_id, { itemId: p.item_id, descricao: p.item_descricao, categoria: p.item_categoria, quantidade: p.quantidade, unidade: p.unidade, estimado: p.valor_estimado, lista: [] });
    }
    grupos.get(p.item_id).lista.push(p);
  }
  return [...grupos.values()].map((g) => {
    const valores = g.lista.map((p) => p.valor);
    return { ...g, menor: Math.min(...valores), maior: Math.max(...valores) };
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
  const [evento, setEvento] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [filtro, setFiltro] = useState(TODAS);
  const [ordem, setOrdem] = useState(Object.keys(ordenacoes)[0]);
  const [mostrarOrdem, setMostrarOrdem] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]);
  const [aberta, setAberta] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarEvento(id), listarPropostas(id)])
      .then(([ev, lista]) => {
        if (!ativo) return;
        setEvento(ev);
        setPropostas(lista);
        setSelecionadas(lista.filter((p) => p.status === "selecionada").map((p) => p.id));
      })
      .catch((err) => {
        if (!ativo) return;
        if (err.status === 404 || err.status === 400) setNaoExiste(true);
        else setErroCarregar(err.message);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id, tentativa]);

  if (naoExiste) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/organizador" rotuloVoltar="Ver meus eventos" />;
  if (carregando)
    return (
      <div role="status" aria-label="Carregando propostas">
        <Esqueleto largura="min(380px, 80%)" altura="32px" style={{ marginBottom: "var(--esp-8)" }} />
        {[0, 1].map((g) => (
          <Card key={g} style={{ padding: "var(--esp-5)", marginBottom: "var(--esp-5)", display: "grid", gap: 14 }}>
            <Esqueleto largura="40%" altura="18px" />
            <Esqueleto altura="44px" />
            <Esqueleto altura="44px" />
          </Card>
        ))}
      </div>
    );
  if (erroCarregar)
    return (
      <ErroCarregar
        titulo="Não foi possível carregar as propostas"
        mensagem={erroCarregar}
        onTentar={() => {
          setCarregando(true);
          setErroCarregar("");
          setTentativa((n) => n + 1);
        }}
      />
    );

  // Só eventos publicados podem ter a seleção alterada; depois de finalizado, a tela é só consulta.
  const editavel = evento.status === "em_andamento";
  const categorias = [TODAS, ...new Set(propostas.map((p) => p.item_categoria))];
  const visiveis = propostas.filter((p) => filtro === TODAS || p.item_categoria === filtro).sort(ordenacoes[ordem]);
  const grupos = agruparPorItem(visiveis);
  const total = propostas.filter((p) => selecionadas.includes(p.id)).reduce((soma, p) => soma + p.valor, 0);

  // Só uma proposta por item: escolher outra do mesmo item troca a anterior.
  function alternar(proposta) {
    if (!editavel) return;
    setSelecionadas((atuais) => {
      if (atuais.includes(proposta.id)) return atuais.filter((x) => x !== proposta.id);
      const outrosItens = atuais.filter((x) => propostas.find((p) => p.id === x).item_id !== proposta.item_id);
      return [...outrosItens, proposta.id];
    });
  }

  async function verResultado() {
    if (!editavel) {
      navigate(`/organizador/eventos/${evento.id}/resultado`);
      return;
    }
    setErroSalvar("");
    setSalvando(true);
    try {
      await salvarSelecao(evento.id, selecionadas);
      navigate(`/organizador/eventos/${evento.id}/resultado`);
    } catch (err) {
      setErroSalvar(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <TituloPagina titulo="Comparação de Propostas" sub={`${propostas.length} ${propostas.length === 1 ? "proposta recebida" : "propostas recebidas"} para ${evento.nome}`}>
        <Btn variante="ghost" tamanho="sm" icone={FileDown} onClick={() => window.print()}>
          Exportar PDF
        </Btn>
      </TituloPagina>

      {!editavel && (
        <Aviso variante="sucesso" style={{ marginBottom: "var(--esp-5)" }}>
          A composição de custos deste evento já foi finalizada. As propostas abaixo estão só para consulta.
        </Aviso>
      )}

      {propostas.length > 0 && (
        <div className="tt-filtros" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }} role="group" aria-label="Filtrar por categoria">
            {categorias.map((f) => (
              <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <Btn variante="secondary" tamanho="sm" icone={ArrowUpDown} onClick={() => setMostrarOrdem(!mostrarOrdem)}>
              {ordem}
            </Btn>
            {mostrarOrdem && (
              <div
                onMouseLeave={() => setMostrarOrdem(false)}
                style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--superficie)", border: "1px solid var(--borda)", borderRadius: "var(--raio-md)", overflow: "hidden", zIndex: 30, minWidth: "200px", boxShadow: "var(--sombra-2)" }}
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
      )}

      {propostas.length === 0 ? (
        <Card>
          <Vazio icone={Inbox} titulo="Nenhuma proposta recebida ainda" texto="Assim que os fornecedores enviarem propostas para os itens deste evento, elas aparecem aqui para comparar." />
        </Card>
      ) : grupos.length === 0 ? (
        <Vazio icone={Inbox} titulo="Nenhuma proposta nesta categoria" texto="Escolha outra categoria para ver as propostas.">
          <Btn variante="secondary" onClick={() => setFiltro(TODAS)}>
            Ver todas as categorias
          </Btn>
        </Vazio>
      ) : (
        grupos.map((g) => (
          <section key={g.itemId} className="tt-grupo-propostas" aria-label={g.descricao}>
            <div className="tt-grupo-propostas__cabeca">
              <div>
                <h3>{g.descricao}</h3>
                <span>
                  {g.categoria}, {g.quantidade.toLocaleString("pt-BR")} {g.unidade}
                </span>
              </div>
              <span>
                Estimado {moeda(g.estimado)}. {g.lista.length} {g.lista.length === 1 ? "proposta" : "propostas"}, melhor preço {moeda(g.menor)}
              </span>
            </div>

            {g.lista.map((p) => {
              const marcada = selecionadas.includes(p.id);
              const melhor = g.lista.length > 1 && p === g.lista.find((x) => x.valor === g.menor);
              const abaixo = g.estimado - p.valor;
              return (
                <div key={p.id} className={`tt-proposta${marcada ? " tt-proposta--marcada" : ""}${melhor ? " tt-proposta--melhor" : ""}`}>
                  <button
                    type="button"
                    className="tt-proposta__marcar"
                    aria-pressed={marcada}
                    aria-label={marcada ? `Desmarcar proposta de ${p.fornecedor_nome}` : `Escolher proposta de ${p.fornecedor_nome}`}
                    onClick={() => alternar(p)}
                    disabled={!editavel}
                    style={!editavel ? { cursor: "default" } : undefined}
                  >
                    {marcada && <Icone icone={Check} tamanho={14} strokeWidth={3} />}
                  </button>

                  <div>
                    <div className="tt-proposta__nome">
                      <strong>{p.fornecedor_nome}</strong>
                      {melhor && (
                        <Badge variante="success">
                          <TextoComIcone icone={Trophy} tamanho={12} style={{ gap: 4 }}>
                            Melhor preço
                          </TextoComIcone>
                        </Badge>
                      )}
                      {!editavel && <StatusBadge status={ROTULO_STATUS_PROPOSTA[p.status]} />}
                    </div>
                    <div className="tt-proposta__avaliacao">
                      <span>Enviada em {dataCurta(p.criado_em)}</span>
                      <span>{abaixo >= 0 ? `${moeda(abaixo)} abaixo do estimado` : `${moeda(-abaixo)} acima do estimado`}</span>
                    </div>
                  </div>

                  <div className="tt-proposta__preco">
                    <span className="tt-proposta__valor">{moeda(p.valor)}</span>
                    <span className="tt-proposta__diferenca">{melhor ? "Mais barata para este item" : g.lista.length > 1 ? diferenca(p.valor, g.menor) : "Única proposta para este item"}</span>
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
              {selecionadas.length} {selecionadas.length === 1 ? "proposta escolhida" : "propostas escolhidas"}
            </span>
            <strong>{total > 0 ? moeda(total) : "Nenhuma ainda"}</strong>
          </div>
          {erroSalvar && (
            <Aviso variante="erro" onFechar={() => setErroSalvar("")} style={{ flex: "1 1 260px" }}>
              {erroSalvar}
            </Aviso>
          )}
          <Btn tamanho="lg" onClick={verResultado} disabled={selecionadas.length === 0} carregando={salvando} iconeDepois={salvando ? undefined : ArrowRight}>
            {salvando ? "Salvando escolha..." : "Ver Resultado da Composição"}
          </Btn>
        </div>
      </div>

      {aberta && (
        <Modal onClose={() => setAberta(null)}>
          <CabecalhoModal onFechar={() => setAberta(null)}>
            <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: 4 }}>{aberta.fornecedor_nome}</h3>
            <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)" }}>Proposta para {aberta.item_descricao}</p>
          </CabecalhoModal>
          <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-2)", lineHeight: 1.6, marginBottom: "var(--esp-4)" }}>{aberta.descricao}</p>
          <ListaDetalhes
            itens={[
              { rotulo: "Quantidade", valor: `${aberta.quantidade.toLocaleString("pt-BR")} ${aberta.unidade}` },
              { rotulo: "Valor estimado", valor: moeda(aberta.valor_estimado) },
              { rotulo: "Válida até", valor: dataCurta(aberta.validade) },
              { rotulo: "Enviada em", valor: dataCurta(aberta.criado_em) },
              ...(aberta.observacoes ? [{ rotulo: "Observações", valor: aberta.observacoes }] : []),
            ]}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--esp-3) var(--esp-4)", background: "var(--sucesso-fundo)", border: "1px solid var(--ok-borda)", borderRadius: "var(--raio-md)", marginBottom: "var(--esp-5)" }}>
            <span style={{ fontWeight: 600, color: "var(--texto-2)" }}>Valor da proposta</span>
            <Valor tamanho="var(--tam-lg)" peso={700}>
              {moeda(aberta.valor)}
            </Valor>
          </div>
          {editavel ? (
            <Btn
              style={{ width: "100%" }}
              icone={selecionadas.includes(aberta.id) ? Check : undefined}
              variante={selecionadas.includes(aberta.id) ? "secondary" : "primary"}
              onClick={() => {
                alternar(aberta);
                setAberta(null);
              }}
            >
              {selecionadas.includes(aberta.id) ? "Escolhida (clique para desmarcar)" : "Escolher esta proposta"}
            </Btn>
          ) : (
            <p style={{ display: "flex", gap: "var(--esp-2)", fontSize: "var(--tam-sm)", color: "var(--texto-suave)" }}>
              <Icone icone={Lock} tamanho={16} />
              Composição finalizada: a escolha não pode mais ser alterada.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
