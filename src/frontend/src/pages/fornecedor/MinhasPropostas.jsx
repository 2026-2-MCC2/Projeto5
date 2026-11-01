import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, Clock, FileText, Inbox, Plus, Wallet } from "lucide-react";
import { Card, Badge, Btn, Chip, StatusBadge, TituloPagina, Tabela, Linha, Celula, Valor, Vazio } from "../../components/ui";
import { Kpi } from "../../components/painel";
import "../../components/organizador.css";
import { listarPropostas } from "../../services/fornecedorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Evento", "Data do Evento", "Categoria", "Valor da Proposta", "Enviada em", "Status"];
const FILTROS = ["Todas", "Em análise", "Aprovada", "Concluído", "Rejeitada"];

export default function MinhasPropostas() {
  const navigate = useNavigate();
  const propostas = listarPropostas();
  const [filtro, setFiltro] = useState("Todas");

  const contar = (status) => propostas.filter((p) => p.status === status).length;
  const volumeAprovado = propostas
    .filter((p) => p.status === "Aprovada" || p.status === "Concluído")
    .reduce((soma, p) => soma + p.valor, 0);
  const ganhas = contar("Aprovada") + contar("Concluído");
  const decididas = ganhas + contar("Rejeitada");

  const visiveis = filtro === "Todas" ? propostas : propostas.filter((p) => p.status === filtro);
  const novaProposta = () => navigate("/fornecedor");

  return (
    <>
      <TituloPagina titulo="Minhas Propostas" sub={`${propostas.length} ${propostas.length === 1 ? "proposta enviada" : "propostas enviadas"}`}>
        <Btn onClick={novaProposta} icone={Plus}>
          Nova Proposta
        </Btn>
      </TituloPagina>

      <div className="tt-grade-kpi">
        <Kpi destaque icone={FileText} rotulo="Total enviadas" valor={propostas.length} detalhe="Desde o seu cadastro" />
        <Kpi icone={Clock} rotulo="Em análise" valor={contar("Em análise")} detalhe="Aguardando decisão do organizador" />
        <Kpi
          icone={CircleCheck}
          rotulo="Aprovadas"
          valor={contar("Aprovada")}
          medidor={decididas ? ganhas / decididas : 0}
          detalhe={decididas ? `${Math.round((ganhas / decididas) * 100)}% de aprovação entre as já decididas` : "Nenhuma decidida ainda"}
        />
        <Kpi icone={Wallet} rotulo="Volume aprovado" valor={moeda(volumeAprovado)} detalhe="Aprovadas e concluídas" />
      </div>

      {propostas.length > 0 && (
        <div className="tt-filtros">
          <div className="tt-filtros__abas" role="group" aria-label="Filtrar por status">
            {FILTROS.map((f) => (
              <Chip key={f} rotulo={`${f} (${f === "Todas" ? propostas.length : contar(f)})`} ativo={filtro === f} onClick={() => setFiltro(f)} redondo={false} />
            ))}
          </div>
        </div>
      )}

      <Card style={{ overflow: "hidden" }}>
        {propostas.length === 0 ? (
          <Vazio icone={Inbox} titulo="Você ainda não enviou propostas" texto="Veja os eventos abertos para cotação e envie sua primeira proposta.">
            <Btn icone={Plus} onClick={novaProposta}>
              Ver oportunidades
            </Btn>
          </Vazio>
        ) : visiveis.length === 0 ? (
          <Vazio icone={Inbox} titulo="Nenhuma proposta com este status" texto="Escolha outro filtro para ver suas propostas.">
            <Btn variante="secondary" onClick={() => setFiltro("Todas")}>
              Ver todas
            </Btn>
          </Vazio>
        ) : (
          <Tabela colunas={colunas}>
            {visiveis.map((p, i) => (
              <Linha key={p.id} ultima={i === visiveis.length - 1}>
                <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>{p.evento}</Celula>
                <Celula style={{ color: "var(--texto-2)" }}>{dataCurta(p.dataEvento)}</Celula>
                <Celula>
                  <Badge>{p.categoria}</Badge>
                </Celula>
                <Celula>
                  <Valor cor="var(--texto)">{moeda(p.valor)}</Valor>
                </Celula>
                <Celula style={{ color: "var(--texto-suave)" }}>{dataCurta(p.enviadaEm)}</Celula>
                <Celula>
                  <StatusBadge status={p.status} />
                </Celula>
              </Linha>
            ))}
          </Tabela>
        )}
      </Card>
    </>
  );
}
