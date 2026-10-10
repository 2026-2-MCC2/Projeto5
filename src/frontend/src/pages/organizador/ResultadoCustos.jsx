import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, CabecalhoCard, Btn, BarraRotulada, Indicador, ModalConfirmacao, TituloPagina, Tabela, Linha, Celula, Valor } from "../../components/ui";
import { buscarEvento, finalizarEvento, propostasSelecionadas, somaEstimado } from "../../services/organizadorService";
import { moeda } from "../../utils/formatar";

const colunas = ["Categoria", "Fornecedor Selecionado", "Estimado", "Acordado", "Economia"];

// Economia positiva = gastou menos que o estimado.
function ValorEconomia({ valor, peso = 400 }) {
  if (valor === 0) return <Valor cor="#9CA3AF" peso={peso}>—</Valor>;
  return (
    <Valor cor={valor > 0 ? "#2563EB" : "#DC2626"} peso={peso}>
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

  if (!evento) return <Navigate to="/organizador" replace />;

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
      <TituloPagina titulo="Resultado da Composição de Custos" sub={`${evento.nome} · ${linhas.length} propostas selecionadas`}>
        <Btn variante="ghost" tamanho="sm" onClick={() => window.print()}>
          📄 Exportar PDF
        </Btn>
      </TituloPagina>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <Indicador rotulo="Orçamento Estimado" valor={moeda(totalEstimado)} cor="#9CA3AF" riscado />
        <Indicador variante="sucesso" rotulo="Total Acordado" valor={moeda(totalAcordado)} cor="#059669" />
        <Indicador
          variante="info"
          rotulo="Economia Total"
          valor={moeda(totalEconomia)}
          cor="#2563EB"
          detalhe={totalEstimado > 0 && `${((totalEconomia / totalEstimado) * 100).toFixed(1)}% de economia`}
        />
      </div>

      <Card style={{ overflow: "hidden", marginBottom: "2rem" }}>
        <CabecalhoCard titulo="Detalhamento por Categoria" />
        <Tabela
          colunas={colunas}
          rodape={
            <tr style={{ background: "#F9FAFB", borderTop: "2px solid #E5E7EB" }}>
              <Celula colSpan={2} style={{ fontFamily: "Outfit", fontWeight: 700, color: "#374151" }}>
                TOTAL
              </Celula>
              <Celula>
                <Valor cor="#9CA3AF" riscado>
                  {moeda(totalEstimado)}
                </Valor>
              </Celula>
              <Celula>
                <Valor tamanho="1rem" peso={700}>
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
              <Celula style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{l.categoria}</Celula>
              <Celula style={{ fontSize: "0.875rem", color: "#6B7280" }}>{l.fornecedor}</Celula>
              <Celula>
                <Valor cor="#9CA3AF" peso={400} riscado>
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

      <Card style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Distribuição do Orçamento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {linhas.map((l) => {
            const porcentagem = (l.acordado / totalAcordado) * 100;
            return <BarraRotulada key={l.categoria} rotulo={l.categoria} valor={`${porcentagem.toFixed(0)}%`} porcentagem={porcentagem} />;
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <Btn variante="ghost" onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)}>
          ← Voltar à Comparação
        </Btn>
        <Btn variante="accent" onClick={() => setConfirmando(true)}>
          🏁 Finalizar Evento
        </Btn>
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone="🏁"
          titulo="Finalizar Evento"
          descricao={
            <>
              O evento será marcado como <strong style={{ color: "#EA580C" }}>Aguardando Data</strong> e os fornecedores serão notificados. Esta ação não pode ser desfeita.
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
