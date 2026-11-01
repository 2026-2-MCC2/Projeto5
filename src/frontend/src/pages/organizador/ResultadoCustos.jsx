import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { ArrowLeft, FileDown, Flag } from "lucide-react";
import { Card, CabecalhoCard, Btn, BarraRotulada, ErroCarregar, Indicador, ModalConfirmacao, TituloPagina, Tabela, Linha, Celula, Valor } from "../../components/ui";
import { EsqueletoTicket, TicketCenarios } from "../../components/organizador";
// Ainda sem API de propostas: a composição usa os dados de exemplo do localStorage.
import { buscarEvento, finalizarEvento, propostasSelecionadas, somaEstimado } from "../../services/mock/organizadorMock";
// Público e margem (para o ticket) vêm do cadastro do evento na API, só para leitura.
import { buscarEvento as buscarEventoCadastro } from "../../services/organizadorService";
import { moeda } from "../../utils/formatar";

const colunas = ["Categoria", "Fornecedor Selecionado", "Estimado", "Acordado", "Economia"];

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
  const [confirmando, setConfirmando] = useState(false);
  const evento = buscarEvento(Number(id));

  // Cadastro do evento (público mínimo/máximo e margem) para calcular o ticket.
  const [cadastro, setCadastro] = useState(null);
  const [carregandoCadastro, setCarregandoCadastro] = useState(true);
  const [erroCadastro, setErroCadastro] = useState(null); // { mensagem, podeTentar }
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    buscarEventoCadastro(id)
      .then((ev) => ativo && setCadastro(ev))
      .catch((err) => {
        if (!ativo) return;
        const naoExiste = err.status === 404 || err.status === 400;
        setErroCadastro({
          mensagem: naoExiste ? "Este evento não tem público e margem cadastrados, então não dá para estimar o ingresso." : err.message,
          podeTentar: !naoExiste,
        });
      })
      .finally(() => ativo && setCarregandoCadastro(false));
    return () => {
      ativo = false;
    };
  }, [id, tentativa]);

  if (!evento) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/organizador" rotuloVoltar="Ver meus eventos" />;

  const linhas = propostasSelecionadas(evento).map((p) => {
    const estimado = somaEstimado(evento.itens.filter((i) => i.categoria === p.categoria));
    return { categoria: p.categoria, fornecedor: p.fornecedor, estimado, acordado: p.valor, economia: estimado - p.valor };
  });

  if (linhas.length === 0) return <Navigate to={`/organizador/eventos/${evento.id}/propostas`} replace />;

  const totalEstimado = linhas.reduce((soma, l) => soma + l.estimado, 0);
  const totalAcordado = linhas.reduce((soma, l) => soma + l.acordado, 0);
  const totalEconomia = totalEstimado - totalAcordado;

  function finalizar() {
    finalizarEvento(evento.id);
    navigate("/organizador");
  }

  return (
    <>
      <TituloPagina titulo="Resultado da Composição de Custos" sub={`${linhas.length} ${linhas.length === 1 ? "proposta selecionada" : "propostas selecionadas"} para ${evento.nome}`}>
        <Btn variante="ghost" tamanho="sm" icone={FileDown} onClick={() => window.print()}>
          Exportar PDF
        </Btn>
      </TituloPagina>

      <div style={{ marginBottom: "var(--esp-6)" }}>
        {carregandoCadastro ? (
          <EsqueletoTicket />
        ) : erroCadastro ? (
          <ErroCarregar
            titulo="Não foi possível calcular o ticket"
            mensagem={erroCadastro.mensagem}
            onTentar={
              erroCadastro.podeTentar
                ? () => {
                    setCarregandoCadastro(true);
                    setErroCadastro(null);
                    setTentativa((n) => n + 1);
                  }
                : undefined
            }
          />
        ) : (
          <TicketCenarios
            custo={totalAcordado}
            rotuloCusto="Total acordado"
            publicoMinimo={cadastro.publico_minimo}
            publicoMaximo={cadastro.publico_maximo}
            margem={cadastro.margem_lucro}
            nota={cadastro.nome !== evento.nome ? `Público e margem vêm do cadastro do evento "${cadastro.nome}".` : undefined}
          />
        )}
      </div>

      <div className="tt-indicadores">
        <Indicador rotulo="Orçamento estimado" valor={moeda(totalEstimado)} cor="var(--texto-suave)" riscado />
        <Indicador variante="sucesso" rotulo="Total acordado" valor={moeda(totalAcordado)} cor="var(--verde-texto)" />
        <Indicador
          variante="info"
          rotulo="Economia total"
          valor={moeda(totalEconomia)}
          cor="var(--azul-texto)"
          detalhe={totalEstimado > 0 && `${((totalEconomia / totalEstimado) * 100).toFixed(1)}% de economia`}
        />
      </div>

      <Card style={{ overflow: "hidden", marginBottom: "var(--esp-6)" }}>
        <CabecalhoCard titulo="Detalhamento por categoria" />
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
            <Linha key={l.categoria} ultima={i === linhas.length - 1}>
              <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>{l.categoria}</Celula>
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

      <Card style={{ padding: "var(--esp-6)", marginBottom: "var(--esp-8)" }}>
        <h3 style={{ fontSize: "var(--tam-md)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-4)" }}>Distribuição do orçamento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--esp-3)" }}>
          {linhas.map((l) => {
            const porcentagem = (l.acordado / totalAcordado) * 100;
            return <BarraRotulada key={l.categoria} rotulo={l.categoria} valor={`${porcentagem.toFixed(0)}%`} porcentagem={porcentagem} />;
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "var(--esp-3)" }}>
        <Btn variante="secondary" icone={ArrowLeft} onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)}>
          Voltar à Comparação
        </Btn>
        <Btn variante="accent" tamanho="lg" icone={Flag} onClick={() => setConfirmando(true)}>
          Finalizar Evento
        </Btn>
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone={Flag}
          variante="accent"
          titulo="Finalizar Evento"
          descricao={
            <>
              O evento será marcado como <strong style={{ color: "var(--laranja-texto)" }}>Aguardando Data</strong> e os fornecedores serão notificados. Esta ação não pode ser desfeita.
            </>
          }
          rotuloValor="Total acordado"
          valor={moeda(totalAcordado)}
          rotuloConfirmar="Confirmar"
          onCancelar={() => setConfirmando(false)}
          onConfirmar={finalizar}
        />
      )}
    </>
  );
}
