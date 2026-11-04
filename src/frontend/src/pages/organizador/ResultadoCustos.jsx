import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowLeft, FileDown, Flag } from "lucide-react";
import { Card, CabecalhoCard, Btn, BarraRotulada, Esqueleto, ErroCarregar, Indicador, ModalConfirmacao, TituloPagina, Tabela, Linha, Celula, Valor } from "../../components/ui";
import { EsqueletoTicket, SeloStatus, TicketCenarios } from "../../components/organizador";
import "../../components/organizador.css";
import { buscarEvento, custoConsolidado, finalizarEvento, listarPropostas, somaEstimado } from "../../services/organizadorService";
import { moeda } from "../../utils/formatar";

const colunas = ["Item", "Fornecedor Escolhido", "Estimado", "Acordado", "Economia"];
const colunasOutros = ["Item", "Tipo", "Custo Estimado"];

const ROTULO_TIPO = { fornecedor: "Sem proposta escolhida", fiscal: "Fiscal", operacional: "Operacional", variavel: "Variável" };

// Economia positiva = gastou menos que o estimado.
function ValorEconomia({ valor, peso = 400 }) {
  if (valor === 0) return <Valor cor="var(--texto-suave)" peso={peso}>—</Valor>;
  return (
    <Valor cor={valor > 0 ? "var(--verde-texto)" : "var(--vermelho-texto)"} peso={peso}>
      {valor > 0 ? "- " : "+ "}
      {moeda(Math.abs(valor))}
    </Valor>
  );
}

export default function ResultadoCustos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [erroFinalizar, setErroFinalizar] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarEvento(id), listarPropostas(id)])
      .then(([ev, lista]) => {
        if (!ativo) return;
        setEvento(ev);
        setPropostas(lista);
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
      <div role="status" aria-label="Carregando resultado">
        <Esqueleto largura="min(460px, 85%)" altura="32px" style={{ marginBottom: "var(--esp-8)" }} />
        <EsqueletoTicket />
      </div>
    );
  if (erroCarregar)
    return (
      <ErroCarregar
        titulo="Não foi possível carregar o resultado"
        mensagem={erroCarregar}
        onTentar={() => {
          setCarregando(true);
          setErroCarregar("");
          setTentativa((n) => n + 1);
        }}
      />
    );

  // Uma linha por item com proposta escolhida.
  const linhas = propostas
    .filter((p) => p.status === "selecionada")
    .map((p) => ({ id: p.id, item: p.item_descricao, categoria: p.item_categoria, fornecedor: p.fornecedor_nome, estimado: p.valor_estimado, acordado: p.valor, economia: p.valor_estimado - p.valor }));

  if (linhas.length === 0) return <Navigate to={`/organizador/eventos/${evento.id}/propostas`} replace />;

  const finalizado = evento.status !== "em_andamento";
  const totalEstimado = linhas.reduce((soma, l) => soma + l.estimado, 0);
  const totalAcordado = linhas.reduce((soma, l) => soma + l.acordado, 0);
  const totalEconomia = totalEstimado - totalAcordado;
  // Tudo o que entra no ticket além das propostas escolhidas.
  const outrosCustos = evento.itens.filter((i) => i.acordado === null);
  const totalOutros = somaEstimado(outrosCustos);
  const custoTotal = custoConsolidado(evento.itens);

  async function finalizar() {
    setErroFinalizar("");
    setFinalizando(true);
    try {
      await finalizarEvento(evento.id);
      navigate(`/organizador/eventos/${evento.id}`, { state: { sucesso: "Composição de custos finalizada. O evento agora está aguardando a data." } });
    } catch (err) {
      setErroFinalizar(err.message);
      setFinalizando(false);
    }
  }

  return (
    <>
      <TituloPagina
        titulo="Resultado da Composição de Custos"
        extra={finalizado && <SeloStatus status={evento.status} />}
        sub={`${linhas.length} ${linhas.length === 1 ? "proposta escolhida" : "propostas escolhidas"} para ${evento.nome}`}
      >
        <Btn variante="ghost" tamanho="sm" icone={FileDown} onClick={() => window.print()}>
          Exportar PDF
        </Btn>
      </TituloPagina>

      <div style={{ marginBottom: "var(--esp-6)" }}>
        <TicketCenarios
          custo={custoTotal}
          rotuloCusto="Custo consolidado"
          publicoMinimo={evento.publico_minimo}
          publicoMaximo={evento.publico_maximo}
          margem={evento.margem_lucro}
          nota={outrosCustos.length > 0 ? `Soma ${moeda(totalAcordado)} acordados com ${moeda(totalOutros)} de outros custos do evento, pelo valor estimado.` : undefined}
        />
      </div>

      <div className="tt-indicadores">
        <Indicador rotulo="Orçamento estimado" valor={moeda(totalEstimado)} cor="var(--texto-suave)" riscado detalhe="Dos itens com proposta escolhida" />
        <Indicador variante="sucesso" rotulo="Total acordado" valor={moeda(totalAcordado)} cor="var(--verde-texto)" />
        <Indicador
          variante="info"
          rotulo={totalEconomia >= 0 ? "Economia total" : "Acima do estimado"}
          valor={moeda(Math.abs(totalEconomia))}
          cor={totalEconomia >= 0 ? "var(--azul-texto)" : "var(--vermelho-texto)"}
          detalhe={totalEstimado > 0 && `${((Math.abs(totalEconomia) / totalEstimado) * 100).toFixed(1)}% ${totalEconomia >= 0 ? "de economia" : "acima do estimado"}`}
        />
      </div>

      <Card style={{ overflow: "hidden", marginBottom: "var(--esp-6)" }}>
        <CabecalhoCard titulo="Detalhamento por item" />
        <Tabela
          colunas={colunas}
          rodape={
            <tr style={{ background: "var(--superficie-2)", borderTop: "2px solid var(--borda)" }}>
              <Celula colSpan={2} style={{ fontWeight: 700, color: "var(--texto)" }}>
                Total
              </Celula>
              <Celula>
                <Valor cor="var(--texto-suave)" riscado>
                  {moeda(totalEstimado)}
                </Valor>
              </Celula>
              <Celula>
                <Valor tamanho="var(--tam-md)" peso={700}>
                  {moeda(totalAcordado)}
                </Valor>
              </Celula>
              <Celula>
                <ValorEconomia valor={totalEconomia} peso={700} />
              </Celula>
            </tr>
          }
        >
          {linhas.map((l, i) => (
            <Linha key={l.id} ultima={i === linhas.length - 1}>
              <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>
                {l.item}
                <span style={{ display: "block", fontSize: "var(--tam-xs)", fontWeight: 400, color: "var(--texto-suave)" }}>{l.categoria}</span>
              </Celula>
              <Celula style={{ color: "var(--texto-2)" }}>{l.fornecedor}</Celula>
              <Celula>
                <Valor cor="var(--texto-suave)" peso={400} riscado>
                  {moeda(l.estimado)}
                </Valor>
              </Celula>
              <Celula>
                <Valor>{moeda(l.acordado)}</Valor>
              </Celula>
              <Celula>
                <ValorEconomia valor={l.economia} />
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Card>

      {outrosCustos.length > 0 && (
        <Card style={{ overflow: "hidden", marginBottom: "var(--esp-6)" }}>
          <CabecalhoCard titulo="Outros custos considerados" sub="Entram no ticket pelo valor estimado." />
          <Tabela
            colunas={colunasOutros}
            rodape={
              <tr style={{ background: "var(--superficie-2)", borderTop: "2px solid var(--borda)" }}>
                <Celula colSpan={2} style={{ fontWeight: 700, color: "var(--texto)" }}>
                  Total
                </Celula>
                <Celula>
                  <Valor tamanho="var(--tam-md)" peso={700}>
                    {moeda(totalOutros)}
                  </Valor>
                </Celula>
              </tr>
            }
          >
            {outrosCustos.map((item, i) => (
              <Linha key={item.id} ultima={i === outrosCustos.length - 1}>
                <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>
                  {item.descricao}
                  <span style={{ display: "block", fontSize: "var(--tam-xs)", fontWeight: 400, color: "var(--texto-suave)" }}>{item.categoria}</span>
                </Celula>
                <Celula style={{ color: "var(--texto-2)" }}>{ROTULO_TIPO[item.tipo] ?? item.tipo}</Celula>
                <Celula>
                  <Valor>{moeda(item.estimado)}</Valor>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Card>
      )}

      <Card style={{ padding: "var(--esp-6)", marginBottom: "var(--esp-8)" }}>
        <h3 style={{ fontSize: "var(--tam-md)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-4)" }}>Distribuição do orçamento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--esp-3)" }}>
          {linhas.map((l) => {
            const porcentagem = (l.acordado / totalAcordado) * 100;
            return <BarraRotulada key={l.id} rotulo={l.item} valor={`${porcentagem.toFixed(0)}%`} porcentagem={porcentagem} />;
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "var(--esp-3)" }}>
        <Btn variante="secondary" icone={ArrowLeft} onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)}>
          {finalizado ? "Ver propostas" : "Voltar à Comparação"}
        </Btn>
        {!finalizado && (
          <Btn variante="accent" tamanho="lg" icone={Flag} onClick={() => setConfirmando(true)}>
            Finalizar Evento
          </Btn>
        )}
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone={Flag}
          variante="accent"
          titulo="Finalizar composição de custos"
          descricao={
            <>
              O evento passa para <strong style={{ color: "var(--laranja-texto)" }}>Aguardando Data</strong>, as propostas escolhidas ficam aprovadas e as outras são recusadas. Esta ação não pode ser desfeita.
            </>
          }
          rotuloValor="Total acordado"
          valor={moeda(totalAcordado)}
          rotuloConfirmar={finalizando ? "Finalizando..." : "Finalizar"}
          carregando={finalizando}
          erro={erroFinalizar}
          onCancelar={() => {
            if (finalizando) return;
            setConfirmando(false);
            setErroFinalizar("");
          }}
          onConfirmar={finalizar}
        />
      )}
    </>
  );
}
