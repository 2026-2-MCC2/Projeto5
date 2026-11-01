import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleCheck, Clock, FileText, Inbox, Plus, Wallet } from "lucide-react";
import { Aviso, Card, Badge, Btn, Chip, Esqueleto, ErroCarregar, StatusBadge, TituloPagina, Tabela, Linha, Celula, Valor, Vazio } from "../../components/ui";
import { Kpi } from "../../components/painel";
import "../../components/organizador.css";
import { listarPropostas } from "../../services/fornecedorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Evento", "Item", "Data do Evento", "Valor da Proposta", "Enviada em", "Status"];

// Status da API → rótulo da tela. Selecionada em evento concluído aparece como "Concluído".
function rotuloStatus(p) {
  if (p.status === "selecionada") return p.evento_status === "concluido" ? "Concluído" : "Aprovada";
  if (p.status === "recusada") return "Rejeitada";
  return "Em análise";
}

const FILTROS = ["Todas", "Em análise", "Aprovada", "Concluído", "Rejeitada"];

export default function MinhasPropostas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? "");
  const [filtro, setFiltro] = useState("Todas");

  // A mensagem de sucesso vem da tela de envio; limpa para não voltar ao recarregar.
  useEffect(() => {
    if (location.state?.sucesso) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    let ativo = true;
    listarPropostas()
      .then((lista) => ativo && setPropostas(lista.map((p) => ({ ...p, rotulo: rotuloStatus(p) }))))
      .catch((err) => ativo && setErro(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const contar = (rotulo) => propostas.filter((p) => p.rotulo === rotulo).length;
  const ganhas = propostas.filter((p) => p.status === "selecionada");
  const volumeAprovado = ganhas.reduce((soma, p) => soma + p.valor, 0);
  const decididas = ganhas.length + contar("Rejeitada");

  const visiveis = filtro === "Todas" ? propostas : propostas.filter((p) => p.rotulo === filtro);
  const novaProposta = () => navigate("/fornecedor");

  return (
    <>
      <TituloPagina
        titulo="Minhas Propostas"
        sub={carregando ? "Carregando suas propostas..." : erro ? undefined : `${propostas.length} ${propostas.length === 1 ? "item cotado" : "itens cotados"}`}
      >
        <Btn onClick={novaProposta} icone={Plus}>
          Nova Proposta
        </Btn>
      </TituloPagina>

      {sucesso && (
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "var(--esp-5)" }}>
          {sucesso}
        </Aviso>
      )}

      {erro ? (
        <ErroCarregar
          titulo="Não foi possível carregar suas propostas"
          mensagem={erro}
          onTentar={() => {
            setCarregando(true);
            setErro("");
            setTentativa((n) => n + 1);
          }}
        />
      ) : (
        <>
          <div className="tt-grade-kpi">
            <Kpi destaque icone={FileText} rotulo="Itens cotados" valor={carregando ? "…" : propostas.length} detalhe="Uma proposta por item de evento" />
            <Kpi icone={Clock} rotulo="Em análise" valor={carregando ? "…" : contar("Em análise")} detalhe="Aguardando decisão do organizador" />
            <Kpi
              icone={CircleCheck}
              rotulo="Aprovadas"
              valor={carregando ? "…" : ganhas.length}
              medidor={decididas ? ganhas.length / decididas : 0}
              detalhe={decididas ? `${Math.round((ganhas.length / decididas) * 100)}% de aprovação entre as já decididas` : "Nenhuma decidida ainda"}
            />
            <Kpi icone={Wallet} rotulo="Volume aprovado" valor={carregando ? "…" : moeda(volumeAprovado)} detalhe="Soma das propostas escolhidas" />
          </div>

          {!carregando && propostas.length > 0 && (
            <div className="tt-filtros">
              <div className="tt-filtros__abas" role="group" aria-label="Filtrar por status">
                {FILTROS.map((f) => (
                  <Chip key={f} rotulo={`${f} (${f === "Todas" ? propostas.length : contar(f)})`} ativo={filtro === f} onClick={() => setFiltro(f)} redondo={false} />
                ))}
              </div>
            </div>
          )}

          <Card style={{ overflow: "hidden" }}>
            {carregando ? (
              <div role="status" aria-label="Carregando propostas" style={{ padding: "var(--esp-5)", display: "grid", gap: 14 }}>
                {[0, 1, 2, 3].map((i) => (
                  <Esqueleto key={i} altura="20px" />
                ))}
              </div>
            ) : propostas.length === 0 ? (
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
                    <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>{p.evento_nome}</Celula>
                    <Celula style={{ color: "var(--texto-2)" }}>
                      {p.item_descricao}
                      <span style={{ display: "block", marginTop: 2 }}>
                        <Badge>{p.item_categoria}</Badge>
                      </span>
                    </Celula>
                    <Celula style={{ color: "var(--texto-2)" }}>{dataCurta(p.evento_data_inicio)}</Celula>
                    <Celula>
                      <Valor cor="var(--texto)">{moeda(p.valor)}</Valor>
                    </Celula>
                    <Celula style={{ color: "var(--texto-suave)" }}>{dataCurta(p.criado_em)}</Celula>
                    <Celula>
                      <StatusBadge status={p.rotulo} />
                    </Celula>
                  </Linha>
                ))}
              </Tabela>
            )}
          </Card>
        </>
      )}
    </>
  );
}
