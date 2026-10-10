import { useNavigate } from "react-router-dom";
import { Card, Rotulo, Badge, Btn, StatusBadge, TituloPagina, Tabela, Linha, Celula } from "../../components/ui";
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

  const indicadores = [
    { rotulo: "Total enviadas", valor: propostas.length, cor: "#6B7280" },
    { rotulo: "Em análise", valor: contar("Em análise"), cor: "#D97706" },
    { rotulo: "Aprovadas", valor: contar("Aprovada"), cor: "#059669" },
    { rotulo: "Volume aprovado", valor: moeda(volumeAprovado), cor: "#2563EB", mono: true },
  ];

  return (
    <>
      <TituloPagina titulo="Minhas Propostas" sub={`${propostas.length} propostas enviadas`}>
        <Btn onClick={() => navigate("/fornecedor")}>+ Nova Proposta</Btn>
      </TituloPagina>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {indicadores.map((k) => (
          <Card key={k.rotulo} style={{ padding: "1.25rem" }}>
            <Rotulo>{k.rotulo}</Rotulo>
            <div style={{ fontFamily: k.mono ? "JetBrains Mono" : "Outfit", fontSize: "1.375rem", fontWeight: 700, color: k.cor }}>{k.valor}</div>
          </Card>
        ))}
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
              <Celula style={{ fontFamily: "JetBrains Mono", fontSize: "0.875rem", fontWeight: 600, color: "#059669" }}>{moeda(p.valor)}</Celula>
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
