import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowRight, Calendar, Check, MapPin, Pencil, Receipt, Trash2, Users } from "lucide-react";
import { Aviso, Card, CardTitulo, CabecalhoCard, Btn, Esqueleto, ErroCarregar, Indicador, ListaInfo, ModalConfirmacao, TextoComIcone, TituloPagina, Tabela, Linha, Celula, RodapeCard, Valor, Vazio } from "../../components/ui";
import { EsqueletoTicket, SeloStatus, TicketCenarios } from "../../components/organizador";
import EditorItens from "../../components/EditorItens";
import { buscarEvento, excluirEvento, salvarItens, somaEstimado } from "../../services/organizadorService";
import { dataCurta, dataHora, moeda, periodo, porcentagem } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd.", "Unidade", "Custo Estimado", "Valor Acordado"];

const publico = (ev) => `${ev.publico_minimo.toLocaleString("pt-BR")}–${ev.publico_maximo.toLocaleString("pt-BR")} pessoas`;

// Esqueleto da tela enquanto o evento carrega.
function EsqueletoDetalhes() {
  return (
    <div role="status" aria-label="Carregando evento">
      <div style={{ marginBottom: "var(--esp-8)" }}>
        <Esqueleto largura="min(420px, 80%)" altura="32px" style={{ marginBottom: 12 }} />
        <Esqueleto largura="min(520px, 95%)" />
      </div>
      <div className="tt-indicadores">
        {[0, 1, 2].map((i) => (
          <Card key={i} style={{ padding: "var(--esp-5) var(--esp-6)" }}>
            <Esqueleto largura="50%" style={{ marginBottom: 12 }} />
            <Esqueleto largura="70%" altura="26px" />
          </Card>
        ))}
      </div>
      <div className="tt-detalhes">
        <div className="tt-detalhes__principal">
          <EsqueletoTicket />
          <Card style={{ padding: "var(--esp-6)", display: "grid", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => (
              <Esqueleto key={i} altura="18px" />
            ))}
          </Card>
        </div>
        <div className="tt-detalhes__lateral">
          <Card style={{ padding: "var(--esp-5)", display: "grid", gap: 10 }}>
            <Esqueleto largura="60%" altura="18px" />
            <Esqueleto />
            <Esqueleto largura="80%" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? "");
  const [erro, setErro] = useState("");
  const [itensEditados, setItensEditados] = useState(null);
  const [salvandoItens, setSalvandoItens] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState("");

  // A mensagem de sucesso vem da tela anterior (criar/editar); limpa para não voltar ao recarregar.
  useEffect(() => {
    if (location.state?.sucesso) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    let ativo = true;
    buscarEvento(id)
      .then((ev) => ativo && setEvento(ev))
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
  if (carregando) return <EsqueletoDetalhes />;
  if (erroCarregar)
    return (
      <ErroCarregar
        titulo="Não foi possível carregar o evento"
        mensagem={erroCarregar}
        onTentar={() => {
          setCarregando(true);
          setErroCarregar("");
          setTentativa((n) => n + 1);
        }}
      />
    );

  const editando = itensEditados !== null;
  const itens = editando ? itensEditados : evento.itens;
  const totalEstimado = somaEstimado(itens);
  const comAcordo = itens.filter((i) => i.acordado !== null);
  const totalAcordado = comAcordo.reduce((soma, i) => soma + i.acordado, 0);
  const economia = comAcordo.reduce((soma, i) => soma + i.estimado - i.acordado, 0);
  const estimadoComAcordo = somaEstimado(comAcordo);
  const removidosComPropostas = editando ? evento.itens.filter((i) => i.totalPropostas > 0 && !itensEditados.some((e) => e.id === i.id)) : [];

  // Custo usado no ticket: valor acordado onde já há proposta escolhida e o estimado no resto.
  const custoPrevisto = totalEstimado - estimadoComAcordo + totalAcordado;
  const tudoAcordado = itens.length > 0 && comAcordo.length === itens.length;

  async function salvar() {
    setErro("");
    setSucesso("");
    setSalvandoItens(true);
    try {
      const salvos = await salvarItens(evento.id, itensEditados);
      setEvento({ ...evento, itens: salvos, orcamento: somaEstimado(salvos) });
      setItensEditados(null);
      setSucesso("Itens do evento salvos com sucesso.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvandoItens(false);
    }
  }

  async function excluir() {
    setErroExcluir("");
    setExcluindo(true);
    try {
      await excluirEvento(evento.id);
      navigate("/organizador", { state: { sucesso: `O evento "${evento.nome}" foi excluído.` } });
    } catch (err) {
      setErroExcluir(err.message);
      setExcluindo(false);
    }
  }

  function fecharExclusao() {
    if (excluindo) return;
    setConfirmandoExclusao(false);
    setErroExcluir("");
  }

  const info = [
    { rotulo: "Categoria", valor: evento.categoria || "—" },
    { rotulo: "Início", valor: dataHora(evento.data_inicio) },
    { rotulo: "Término", valor: dataHora(evento.data_fim) },
    { rotulo: "Local", valor: evento.local },
    { rotulo: "Público", valor: publico(evento) },
    { rotulo: "Margem de Lucro", valor: porcentagem(evento.margem_lucro) },
    { rotulo: "Orçamento", valor: moeda(totalEstimado) },
  ];

  return (
    <>
      <TituloPagina
        titulo={evento.nome}
        extra={<SeloStatus status={evento.status} />}
        sub={
          <span style={{ display: "inline-flex", gap: "var(--esp-4)", flexWrap: "wrap" }}>
            <TextoComIcone icone={Calendar}>{periodo(evento.data_inicio, evento.data_fim)}</TextoComIcone>
            <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
            <TextoComIcone icone={Users}>{publico(evento)}</TextoComIcone>
          </span>
        }
      >
        <div style={{ display: "flex", gap: "var(--esp-2)", flexWrap: "wrap" }}>
          {editando ? (
            <>
              <Btn variante="ghost" onClick={() => { setItensEditados(null); setErro(""); }} disabled={salvandoItens}>
                Descartar
              </Btn>
              <Btn onClick={salvar} icone={Check} carregando={salvandoItens}>
                {salvandoItens ? "Salvando..." : "Salvar Itens"}
              </Btn>
            </>
          ) : (
            <>
              <Btn variante="danger" icone={Trash2} onClick={() => setConfirmandoExclusao(true)}>
                Excluir
              </Btn>
              <Btn variante="secondary" icone={Pencil} onClick={() => navigate(`/organizador/eventos/${evento.id}/editar`)}>
                Editar Evento
              </Btn>
              <Btn variante="secondary" icone={Receipt} onClick={() => { setItensEditados(evento.itens); setSucesso(""); }}>
                Editar Itens
              </Btn>
            </>
          )}
        </div>
      </TituloPagina>

      {sucesso && (
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "var(--esp-5)" }}>
          {sucesso}
        </Aviso>
      )}
      {erro && (
        <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginBottom: "var(--esp-5)" }}>
          {erro}
        </Aviso>
      )}
      {removidosComPropostas.length > 0 && (
        <Aviso variante="erro" style={{ marginBottom: "var(--esp-5)" }}>
          Atenção: ao salvar, as propostas recebidas para {removidosComPropostas.map((i) => `"${i.descricao}"`).join(", ")} também serão apagadas.
        </Aviso>
      )}

      <div className="tt-indicadores">
        <Indicador rotulo="Orçamento estimado" valor={moeda(totalEstimado)} detalhe={`${itens.length} ${itens.length === 1 ? "item" : "itens"} de custo`} />
        <Indicador
          rotulo="Total acordado"
          valor={comAcordo.length ? moeda(totalAcordado) : "—"}
          cor={comAcordo.length ? "var(--verde-texto)" : "var(--texto-suave)"}
          detalhe={comAcordo.length ? `${comAcordo.length} de ${itens.length} itens com proposta escolhida` : "Nenhuma proposta escolhida ainda"}
        />
        <Indicador rotulo="Propostas recebidas" valor={evento.total_propostas} cor={evento.total_propostas ? "var(--azul-texto)" : "var(--texto-suave)"} detalhe={evento.total_propostas ? "de fornecedores qualificados" : "Nenhuma até agora"} />
      </div>

      <div className="tt-detalhes">
        <div className="tt-detalhes__principal">
          <TicketCenarios
            custo={custoPrevisto}
            rotuloCusto={tudoAcordado ? "Total acordado" : "Custo previsto"}
            publicoMinimo={evento.publico_minimo}
            publicoMaximo={evento.publico_maximo}
            margem={evento.margem_lucro}
            nota={
              tudoAcordado
                ? undefined
                : comAcordo.length
                  ? `Usa o valor acordado de ${comAcordo.length} ${comAcordo.length === 1 ? "item" : "itens"} e o custo estimado dos demais.`
                  : "Usa os custos estimados. Quando você escolher as propostas, o ticket passa a usar os valores acordados."
            }
          />

          <Card style={{ overflow: "hidden" }}>
            <CabecalhoCard titulo={editando ? <TextoComIcone icone={Pencil}>Editar itens do evento</TextoComIcone> : "Itens do evento"} />

            {editando ? (
              <EditorItens itens={itensEditados} onChange={setItensEditados} />
            ) : itens.length === 0 ? (
              <Vazio icone={Receipt} titulo="Nenhum item cadastrado" texto="Liste o que o evento precisa contratar para receber propostas.">
                <Btn variante="secondary" icone={Receipt} onClick={() => { setItensEditados(evento.itens); setSucesso(""); }}>
                  Adicionar itens
                </Btn>
              </Vazio>
            ) : (
              <>
                <Tabela colunas={colunas}>
                  {itens.map((item, i) => (
                    <Linha key={item.id} ultima={i === itens.length - 1}>
                      <Celula style={{ color: "var(--texto)", fontWeight: 500 }}>{item.descricao}</Celula>
                      <Celula>
                        <Valor cor="var(--texto-suave)" peso={400}>
                          {item.quantidade}
                        </Valor>
                      </Celula>
                      <Celula style={{ color: "var(--texto-suave)" }}>{item.unidade}</Celula>
                      <Celula>
                        <Valor cor="var(--texto-2)" peso={400}>
                          {moeda(item.estimado)}
                        </Valor>
                      </Celula>
                      <Celula>
                        <Valor cor={item.acordado === null ? "var(--texto-suave)" : "var(--verde-texto)"}>{item.acordado === null ? "—" : moeda(item.acordado)}</Valor>
                      </Celula>
                    </Linha>
                  ))}
                </Tabela>
                <RodapeCard>
                  <span style={{ fontSize: "var(--tam-sm)", fontWeight: 600, color: "var(--texto-suave)" }}>Total</span>
                  <div style={{ display: "flex", gap: "var(--esp-6)", alignItems: "center" }}>
                    <Valor cor="var(--texto-suave)" peso={400} riscado={totalAcordado > 0}>
                      {moeda(totalEstimado)}
                    </Valor>
                    {totalAcordado > 0 && (
                      <Valor tamanho="var(--tam-lg)" peso={700}>
                        {moeda(totalAcordado)}
                      </Valor>
                    )}
                  </div>
                </RodapeCard>
              </>
            )}
          </Card>
        </div>

        <div className="tt-detalhes__lateral">
          <Card style={{ padding: "var(--esp-5)" }}>
            <CardTitulo>Propostas comerciais</CardTitulo>
            <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>
              {evento.total_propostas > 0
                ? `${evento.total_propostas} propostas comerciais recebidas de fornecedores qualificados`
                : "Nenhuma proposta recebida até agora"}
            </p>
            <Btn style={{ width: "100%" }} disabled={evento.total_propostas === 0} onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)} iconeDepois={ArrowRight}>
              Ver Propostas
            </Btn>
          </Card>

          <Card style={{ padding: "var(--esp-5)" }}>
            <CardTitulo>Informações do evento</CardTitulo>
            <ListaInfo itens={info} />
            {evento.descricao && (
              <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", lineHeight: 1.6, marginTop: "var(--esp-4)", paddingTop: "var(--esp-4)", borderTop: "1px solid var(--borda)" }}>{evento.descricao}</p>
            )}
          </Card>

          {comAcordo.length > 0 && estimadoComAcordo > 0 && (
            <Indicador
              variante="sucesso"
              rotulo="Economia obtida"
              valor={moeda(economia)}
              cor="var(--verde-texto)"
              detalhe={`${((Math.abs(economia) / estimadoComAcordo) * 100).toFixed(1)}% ${economia >= 0 ? "abaixo" : "acima"} do estimado`}
            />
          )}

          <p style={{ fontSize: "var(--tam-xs)", color: "var(--texto-suave)", textAlign: "center" }}>Criado em {dataCurta(evento.criado_em)}</p>
        </div>
      </div>

      {confirmandoExclusao && (
        <ModalConfirmacao
          icone={Trash2}
          variante="error"
          titulo="Excluir evento?"
          descricao={
            <>
              <strong style={{ color: "var(--texto)" }}>{evento.nome}</strong> será excluído junto com todos os itens de custo e propostas recebidas. Esta ação não pode ser desfeita.
            </>
          }
          rotuloConfirmar={excluindo ? "Excluindo..." : "Excluir Evento"}
          iconeConfirmar={Trash2}
          varianteConfirmar="danger"
          carregando={excluindo}
          erro={erroExcluir}
          onCancelar={fecharExclusao}
          onConfirmar={excluir}
        />
      )}
    </>
  );
}
