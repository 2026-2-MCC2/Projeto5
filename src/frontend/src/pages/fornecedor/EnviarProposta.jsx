import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { Building2, Calendar, Check, CircleAlert, Lock, MapPin, Send, Users } from "lucide-react";
import {
  Aviso,
  Badge,
  Card,
  CardTitulo,
  CabecalhoCard,
  Btn,
  Campo,
  Esqueleto,
  ErroCarregar,
  Icone,
  Input,
  TextArea,
  ListaInfo,
  ModalConfirmacao,
  Picote,
  StatusBadge,
  TextoComIcone,
  TituloPagina,
  Tabela,
  Linha,
  Celula,
  Valor,
} from "../../components/ui";
import { EsqueletoTicket } from "../../components/organizador";
import "../../components/organizador.css";
import { buscarEvento, enviarProposta, listarPropostas } from "../../services/fornecedorService";
import { dataCurta, diasAFrenteIso, hojeIso, moeda } from "../../utils/formatar";

const DIAS_VALIDADE_PADRAO = 30;

const colunas =["Descrição", "Qtd. Solicitada", "Unidade", "Preço Ofertado (unit.)", "Subtotal"];

// Status da proposta (API) → rótulo usado pelo StatusBadge.
const ROTULO_STATUS_PROPOSTA = { em_analise: "Em análise", selecionada: "Aprovada", recusada: "Rejeitada" };

const centavos = (valor) => Math.round(valor * 100) / 100;

function EsqueletoTela() {
  return (
    <div role="status" aria-label="Carregando evento">
      <Esqueleto largura="min(420px, 80%)" altura="32px" style={{ marginBottom: 12 }} />
      <Esqueleto largura="min(360px, 90%)" style={{ marginBottom: "var(--esp-8)" }} />
      <div className="tt-detalhes">
        <Card style={{ padding: "var(--esp-6)", display: "grid", gap: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Esqueleto key={i} altura="20px" />
          ))}
        </Card>
        <EsqueletoTicket />
      </div>
    </div>
  );
}

export default function EnviarProposta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [enviadas, setEnviadas] = useState([]); // minhas propostas já enviadas para este evento
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [precos, setPrecos] = useState({}); // item_id -> preço unitário digitado
  const [descricao, setDescricao] = useState("");
  const [validade, setValidade] = useState(() => diasAFrenteIso(DIAS_VALIDADE_PADRAO));
  const [observacoes, setObservacoes] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarEvento(id), listarPropostas()])
      .then(([ev, minhas]) => {
        if (!ativo) return;
        setEvento(ev);
        setEnviadas(minhas.filter((p) => p.evento_id === ev.id));
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

  if (naoExiste) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/fornecedor" rotuloVoltar="Ver oportunidades" />;
  if (carregando) return <EsqueletoTela />;
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

  const aberto = evento.status === "em_andamento";
  const enviadaPorItem = new Map(enviadas.map((p) => [p.item_id, p]));
  // Custos fiscais, operacionais e variáveis não são cotados por fornecedores.
  const cotaveis = evento.itens.filter((i) => i.tipo === "fornecedor");
  const pendentes = cotaveis.filter((i) => !enviadaPorItem.has(i.id));
  const comPreco = pendentes.filter((i) => precos[i.id] > 0);
  const total = comPreco.reduce((soma, i) => soma + precos[i.id] * i.quantidade, 0);
  const validadeOk = Boolean(validade) && validade >= hojeIso();
  // O que ainda impede o envio, na ordem em que aparece na tela.
  const pendencia =
    comPreco.length === 0
      ? "Preencha o preço de pelo menos um item"
      : !descricao.trim()
        ? "Descreva o que a proposta inclui"
        : !validadeOk
          ? "Informe uma validade a partir de hoje"
          : "";
  const podeEnviar = aberto && !pendencia;

  function alterarPreco(itemId, valor) {
    setPrecos({ ...precos, [itemId]: valor === "" ? 0 : Number(valor) });
  }

  async function enviar() {
    setErroEnvio("");
    setEnviando(true);
    try {
      await enviarProposta(evento.id, {
        itens: comPreco.map((i) => ({ item_id: i.id, valor: centavos(precos[i.id] * i.quantidade) })),
        descricao,
        validade,
        observacoes,
      });
      navigate("/fornecedor/propostas", { state: { sucesso: `Proposta enviada para "${evento.nome}".` } });
    } catch (err) {
      setErroEnvio(err.message);
      setEnviando(false);
    }
  }

  const resumo = [
    { rotulo: "Organizador", valor: evento.organizador_nome ?? "—" },
    { rotulo: "Data", valor: dataCurta(evento.data_inicio) },
    { rotulo: "Local", valor: evento.local },
    { rotulo: "Público", valor: `${evento.publico_minimo.toLocaleString("pt-BR")}–${evento.publico_maximo.toLocaleString("pt-BR")} pessoas` },
    { rotulo: "Orçamento estimado", valor: moeda(evento.orcamento) },
  ];

  return (
    <>
      <TituloPagina
        titulo={evento.nome}
        extra={evento.categoria && <Badge>{evento.categoria}</Badge>}
        sub={
          <span style={{ display: "inline-flex", gap: "var(--esp-4)", flexWrap: "wrap" }}>
            <TextoComIcone icone={Calendar}>{dataCurta(evento.data_inicio)}</TextoComIcone>
            <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
            <TextoComIcone icone={Users}>{`${evento.publico_minimo.toLocaleString("pt-BR")}–${evento.publico_maximo.toLocaleString("pt-BR")} pessoas`}</TextoComIcone>
            {evento.organizador_nome && <TextoComIcone icone={Building2}>{evento.organizador_nome}</TextoComIcone>}
          </span>
        }
      />

      {!aberto && (
        <Aviso variante="erro" style={{ marginBottom: "var(--esp-5)" }}>
          Este evento não está mais recebendo propostas.{enviadas.length > 0 && " Suas propostas enviadas continuam listadas abaixo."}
        </Aviso>
      )}

      <div className="tt-detalhes">
        <div className="tt-detalhes__principal">
          <Card style={{ overflow: "hidden" }}>
            <CabecalhoCard titulo="Formulário de proposta" sub="Preencha o preço unitário dos itens que você quer cotar. Pode deixar em branco os que você não fornece.">
              {pendentes.length > 0 && (
                <span className="tt-progresso-itens">
                  <span>
                    <strong>
                      {comPreco.length} de {pendentes.length}
                    </strong>{" "}
                    itens com preço
                  </span>
                  <span className="tt-progresso-itens__barra" aria-hidden="true">
                    <span style={{ width: `${(comPreco.length / pendentes.length) * 100}%` }} />
                  </span>
                </span>
              )}
            </CabecalhoCard>

            <Tabela colunas={colunas}>
              {cotaveis.map((item, i) => {
                const enviada = enviadaPorItem.get(item.id);
                const preco = precos[item.id] ?? 0;
                return (
                  <Linha key={item.id} ultima={i === cotaveis.length - 1}>
                    <Celula style={{ color: "var(--texto)", fontWeight: 500 }}>
                      {item.descricao}
                      <span style={{ display: "block", fontSize: "var(--tam-xs)", color: "var(--texto-suave)", fontWeight: 400 }}>{item.categoria}</span>
                    </Celula>
                    <Celula>
                      <Valor cor="var(--texto-2)" peso={400}>
                        {item.quantidade.toLocaleString("pt-BR")}
                      </Valor>
                    </Celula>
                    <Celula style={{ color: "var(--texto-suave)" }}>{item.unidade}</Celula>
                    <Celula>
                      {enviada ? (
                        <StatusBadge status={ROTULO_STATUS_PROPOSTA[enviada.status]} />
                      ) : (
                        <div style={{ position: "relative", width: "140px" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "var(--tam-sm)", color: "var(--texto-suave)", pointerEvents: "none" }}>R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            aria-label={`Preço unitário de ${item.descricao}`}
                            value={preco || ""}
                            onChange={(e) => alterarPreco(item.id, e.target.value)}
                            destacado={preco > 0}
                            disabled={!aberto}
                            style={{ paddingLeft: "36px", minHeight: "36px" }}
                          />
                        </div>
                      )}
                    </Celula>
                    <Celula>
                      {enviada ? (
                        <Valor cor="var(--texto-2)">{moeda(enviada.valor)}</Valor>
                      ) : (
                        <Valor cor={preco > 0 ? "var(--verde-texto)" : "var(--texto-suave)"}>{preco > 0 ? moeda(centavos(preco * item.quantidade)) : "—"}</Valor>
                      )}
                    </Celula>
                  </Linha>
                );
              })}
            </Tabela>
          </Card>

          {pendentes.length > 0 && aberto && (
            <Card style={{ padding: "var(--esp-5) var(--esp-6)" }}>
              <CardTitulo>Detalhes da proposta</CardTitulo>
              <div style={{ display: "grid", gap: "var(--esp-4)" }}>
                <Campo rotulo="Descrição *">
                  <TextArea rows={3} placeholder="O que a proposta inclui: serviços, equipe, materiais..." value={descricao} maxLength={2000} onChange={(e) => setDescricao(e.target.value)} />
                </Campo>
                <Campo rotulo="Válida até *">
                  <Input type="date" min={hojeIso()} value={validade} onChange={(e) => setValidade(e.target.value)} style={{ maxWidth: "220px" }} />
                </Campo>
                <Campo rotulo="Observações (opcional)">
                  <TextArea rows={3} placeholder="Condições especiais, prazos, formas de pagamento..." value={observacoes} maxLength={2000} onChange={(e) => setObservacoes(e.target.value)} />
                </Campo>
              </div>
            </Card>
          )}
        </div>

        <div className="tt-detalhes__lateral tt-lateral-fixa">
          <section className="tt-ticket-estimado" aria-label="Sua proposta">
            <div className="tt-ticket-estimado__topo">
              <span className="tt-ticket-estimado__icone">
                <Icone icone={Send} tamanho={18} />
              </span>
              <div>
                <h3>Sua proposta</h3>
                <p>Para {evento.organizador_nome ?? "o organizador"}</p>
              </div>
            </div>
            <Picote />
            <div style={{ padding: "var(--esp-5) var(--esp-6)" }}>
              {cotaveis.length === 0 ? (
                <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-suave)" }}>Este evento não tem itens abertos para cotação.</p>
              ) : pendentes.length === 0 ? (
                <p style={{ display: "flex", gap: "var(--esp-2)", color: "var(--verde-texto)", fontSize: "var(--tam-base)" }}>
                  <Icone icone={Check} tamanho={18} />
                  Você já enviou proposta para todos os itens deste evento.
                </p>
              ) : (
                <>
                  <span className="tt-ticket-estimado__rotulo">Valor total</span>
                  <strong className="tt-ticket-estimado__preco" style={{ display: "block", marginTop: 4, color: total > 0 ? "var(--texto)" : "var(--texto-suave)" }}>
                    {total > 0 ? moeda(centavos(total)) : "R$ 0"}
                  </strong>
                  <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", margin: "var(--esp-2) 0 var(--esp-5)" }}>Orçamento estimado do organizador: {moeda(evento.orcamento)}</p>

                  <Btn tamanho="lg" icone={aberto ? Send : Lock} onClick={() => setConfirmando(true)} disabled={!podeEnviar} style={{ width: "100%" }}>
                    Enviar proposta
                  </Btn>
                  {aberto && !podeEnviar && (
                    <p className="tt-pendencia" style={{ marginTop: "var(--esp-3)" }}>
                      <Icone icone={CircleAlert} tamanho={16} />
                      {pendencia}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <Card style={{ padding: "var(--esp-5)" }}>
            <CardTitulo>Resumo do evento</CardTitulo>
            <ListaInfo itens={resumo} />
          </Card>
        </div>
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone={Send}
          titulo="Confirmar envio"
          descricao={`Sua proposta para ${comPreco.length} ${comPreco.length === 1 ? "item" : "itens"} será enviada ao organizador do evento para análise. Depois de enviada, ela não pode ser alterada.`}
          rotuloValor="Valor total da proposta"
          valor={moeda(centavos(total))}
          rotuloCancelar="Revisar"
          rotuloConfirmar={enviando ? "Enviando..." : "Enviar Proposta"}
          iconeConfirmar={Check}
          carregando={enviando}
          erro={erroEnvio}
          onCancelar={() => {
            if (enviando) return;
            setConfirmando(false);
            setErroEnvio("");
          }}
          onConfirmar={enviar}
        />
      )}
    </>
  );
}
