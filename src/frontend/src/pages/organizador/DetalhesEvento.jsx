import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowRight, Calendar, Check, MapPin, Pencil, Receipt, Trash2, Users } from "lucide-react";
import { Aviso, Card, CardTitulo, CabecalhoCard, Btn, Carregando, Indicador, ListaInfo, ModalConfirmacao, StatusBadge, TextoComIcone, TituloPagina, Tabela, Linha, Celula, RodapeCard, Valor, Vazio } from "../../components/ui";
import EditorItens from "../../components/EditorItens";
import { buscarEvento, excluirEvento, salvarItens, somaEstimado } from "../../services/organizadorService";
import { ROTULO_STATUS_EVENTO } from "../../data/statusEvento";
import { dataCurta, dataHora, moeda, periodo, porcentagem } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd.", "Unidade", "Custo Estimado", "Valor Acordado"];

const publico = (ev) => `${ev.publico_minimo.toLocaleString("pt-BR")}–${ev.publico_maximo.toLocaleString("pt-BR")} pessoas`;

export default function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
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
  }, [id]);

  if (naoExiste) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/organizador" rotuloVoltar="Ver meus eventos" />;
  if (carregando) return <Carregando texto="Carregando evento..." />;
  if (erroCarregar) return <Aviso variante="erro">{erroCarregar}</Aviso>;

  const editando = itensEditados !== null;
  const itens = editando ? itensEditados : evento.itens;
  const totalEstimado = somaEstimado(itens);
  const comAcordo = itens.filter((i) => i.acordado !== null);
  const totalAcordado = comAcordo.reduce((soma, i) => soma + i.acordado, 0);
  const economia = comAcordo.reduce((soma, i) => soma + i.estimado - i.acordado, 0);
  const estimadoComAcordo = somaEstimado(comAcordo);
  const removidosComPropostas = editando ? evento.itens.filter((i) => i.totalPropostas > 0 && !itensEditados.some((e) => e.id === i.id)) : [];

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
        extra={<StatusBadge status={ROTULO_STATUS_EVENTO[evento.status]} />}
        sub={
          <span style={{ display: "inline-flex", gap: "16px", flexWrap: "wrap" }}>
            <TextoComIcone icone={Calendar}>{periodo(evento.data_inicio, evento.data_fim)}</TextoComIcone>
            <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
            <TextoComIcone icone={Users}>{publico(evento)}</TextoComIcone>
          </span>
        }
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "1.25rem" }}>
          {sucesso}
        </Aviso>
      )}
      {erro && (
        <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginBottom: "1.25rem" }}>
          {erro}
        </Aviso>
      )}
      {removidosComPropostas.length > 0 && (
        <Aviso variante="erro" style={{ marginBottom: "1.25rem" }}>
          Atenção: ao salvar, as propostas recebidas para {removidosComPropostas.map((i) => `"${i.descricao}"`).join(", ")} também serão apagadas.
        </Aviso>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "1.5rem", alignItems: "start" }}>
        <Card style={{ overflow: "hidden" }}>
          <CabecalhoCard titulo={editando ? <TextoComIcone icone={Pencil}>Editar Itens do Evento</TextoComIcone> : "Itens do Evento"} />

          {editando ? (
            <EditorItens itens={itensEditados} onChange={setItensEditados} />
          ) : itens.length === 0 ? (
            <Vazio icone={Receipt} texto="Nenhum item cadastrado. Clique em Editar Itens para adicionar." />
          ) : (
            <>
              <Tabela colunas={colunas}>
                {itens.map((item, i) => (
                  <Linha key={item.id} ultima={i === itens.length - 1}>
                    <Celula style={{ fontSize: "0.875rem", color: "var(--texto)" }}>{item.descricao}</Celula>
                    <Celula>
                      <Valor cor="var(--texto-suave)" peso={400}>
                        {item.quantidade}
                      </Valor>
                    </Celula>
                    <Celula style={{ fontSize: "0.875rem", color: "var(--texto-suave)" }}>{item.unidade}</Celula>
                    <Celula>
                      <Valor cor="var(--texto-fraco)" peso={400}>
                        {moeda(item.estimado)}
                      </Valor>
                    </Celula>
                    <Celula>
                      <Valor cor={item.acordado === null ? "var(--texto-fraco)" : "#059669"}>{item.acordado === null ? "—" : moeda(item.acordado)}</Valor>
                    </Celula>
                  </Linha>
                ))}
              </Tabela>
              <RodapeCard>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--texto-suave)" }}>Total</span>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <Valor cor="var(--texto-fraco)" peso={400} riscado={totalAcordado > 0}>
                    {moeda(totalEstimado)}
                  </Valor>
                  {totalAcordado > 0 && (
                    <Valor tamanho="1.125rem" peso={700}>
                      {moeda(totalAcordado)}
                    </Valor>
                  )}
                </div>
              </RodapeCard>
            </>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h4 style={{ fontFamily: "Outfit", fontWeight: 700, color: "var(--texto)", fontSize: "0.9375rem" }}>Propostas Comerciais</h4>
              <span style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 800, color: "#2563EB" }}>{evento.total_propostas}</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--texto-fraco)", marginBottom: "14px", lineHeight: 1.5 }}>
              {evento.total_propostas > 0
                ? `${evento.total_propostas} propostas comerciais recebidas de fornecedores qualificados`
                : "Nenhuma proposta recebida até agora"}
            </p>
            <Btn style={{ width: "100%" }} disabled={evento.total_propostas === 0} onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)} iconeDepois={ArrowRight}>
              Ver Propostas
            </Btn>
          </Card>

          <Card style={{ padding: "1.25rem" }}>
            <CardTitulo>Informações do Evento</CardTitulo>
            <ListaInfo itens={info} />
            {evento.descricao && (
              <p style={{ fontSize: "0.8125rem", color: "var(--texto-suave)", lineHeight: 1.6, marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--borda)" }}>{evento.descricao}</p>
            )}
          </Card>

          {comAcordo.length > 0 && estimadoComAcordo > 0 && (
            <Indicador
              variante="sucesso"
              rotulo="Economia Obtida"
              valor={moeda(economia)}
              cor="#059669"
              detalhe={`${((Math.abs(economia) / estimadoComAcordo) * 100).toFixed(1)}% ${economia >= 0 ? "abaixo" : "acima"} do estimado`}
            />
          )}

          <p style={{ fontSize: "0.75rem", color: "var(--texto-fraco)", textAlign: "center" }}>Criado em {dataCurta(evento.criado_em)}</p>
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
