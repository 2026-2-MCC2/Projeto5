import { useNavigate } from "react-router-dom";
import { Card, Badge, Btn, Indicador, StatusBadge, TituloPagina, Tabela, Linha, Celula, Valor } from "../../components/ui";
import { listarPropostas } from "../../services/fornecedorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Evento", "Data do Evento", "Categoria", "Valor da Proposta", "Enviada em", "Status"];

export default function MinhasPropostas() {
  const navigate = useNavigate();
  const propostas = listarPropostas();

  const contar = (status) => propostas.filter((p) => p.status === status).length;
  const volumeAprovado = propostas
    .filter((p) => p.status === "Aprovada" || p.status === "Concluído")
    .reduce((soma, p) => soma + p.valor, 0);

  return (
    <>
      <TituloPagina titulo="Minhas Propostas" sub={`${propostas.length} propostas enviadas`}>
        <Btn onClick={() => navigate("/fornecedor")}>+ Nova Proposta</Btn>
      </TituloPagina>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <Indicador rotulo="Total enviadas" valor={propostas.length} cor="#6B7280" mono={false} tamanho="1.375rem" />
        <Indicador rotulo="Em análise" valor={contar("Em análise")} cor="#D97706" mono={false} tamanho="1.375rem" />
        <Indicador rotulo="Aprovadas" valor={contar("Aprovada")} cor="#059669" mono={false} tamanho="1.375rem" />
        <Indicador rotulo="Volume aprovado" valor={moeda(volumeAprovado)} cor="#2563EB" tamanho="1.375rem" />
      </div>

      <Card style={{ overflow: "hidden" }}>
        <Tabela colunas={colunas}>
          {propostas.map((p, i) => (
            <Linha
              key={p.id}
              ultima={i === propostas.length - 1}
              style={{ transition: "background 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Celula style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{p.evento}</Celula>
              <Celula style={{ fontSize: "0.8125rem", color: "#6B7280" }}>{dataCurta(p.dataEvento)}</Celula>
              <Celula>
                <Badge>{p.categoria}</Badge>
              </Celula>
              <Celula>
                <Valor>{moeda(p.valor)}</Valor>
              </Celula>
              <Celula style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>{dataCurta(p.enviadaEm)}</Celula>
              <Celula>
                <StatusBadge status={p.status} />
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Card>
    </>
  );
}
