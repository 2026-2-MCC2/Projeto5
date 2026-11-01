import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Activity, Ban, Building2, CalendarClock, CalendarPlus, CircleCheck, ClipboardList, FileDown, FilePen, Inbox, UserCheck, Wallet } from "lucide-react";
import { Card, Btn, CabecalhoModal, Chip, ListaDetalhes, Modal, StatusBadge, TituloPagina, Tabela, Linha, Celula, Vazio } from "../../components/ui";
import { CartaoGrafico, GraficoBarras, GraficoColunas, Kpi } from "../../components/painel";
import "../../components/organizador.css";
// Ainda sem API para os indicadores do admin: usa os dados de exemplo do localStorage.
import { listarEventos } from "../../services/mock/organizadorMock";
import { listarUsuarios } from "../../services/mock/usuariosMock";
import { dataCurta, dentroDosUltimos, mesAno, moeda, tempoDesde } from "../../utils/formatar";

const POR_PAGINA = 5;

const diasDesdeInicioDoAno = () => Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000));

// Cada período filtra pela data de cadastro. Itens de exemplo, sem data de cadastro, só entram em "Histórico".
const periodos = {
  "7 dias": () => 7,
  "30 dias": () => 30,
  "Este ano": diasDesdeInicioDoAno,
  "Histórico": () => undefined,
};

const ABA_EVENTOS = "Eventos Recentes";
const ABA_FORNECEDORES = "Fornecedores Pendentes";

// Estados de evento no gráfico: cor de status sempre junto com ícone e rótulo.
const STATUS_GRAFICO = [
  { status: "Em andamento", variante: "info", icone: Activity },
  { status: "Aguardando Data", variante: "warning", icone: CalendarClock },
  { status: "Concluído", variante: "success", icone: CircleCheck },
  { status: "Rascunho", variante: "neutral", icone: FilePen },
  { status: "Cancelado", variante: "error", icone: Ban },
];

// R$ 1.785.000 -> "R$ 1,8 mi"; R$ 95.000 -> "R$ 95 mil"
function moedaCompacta(valor) {
  const fmt = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (valor >= 1e6) return `R$ ${fmt(valor / 1e6)} mi`;
  if (valor >= 1e3) return `R$ ${fmt(valor / 1e3)} mil`;
  return moeda(valor);
}

function Paginacao({ pagina, total, onChange }) {
  if (total <= 1) return null;
  return (
    <nav className="tt-paginacao" aria-label="Páginas">
      <button type="button" disabled={pagina === 1} onClick={() => onChange(Math.max(1, pagina - 1))}>
        Anterior
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" aria-current={pagina === n ? "page" : undefined} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
      <button type="button" disabled={pagina === total} onClick={() => onChange(Math.min(total, pagina + 1))}>
        Próximo
      </button>
    </nav>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { pendentes, carregandoPendentes } = useOutletContext();
  const [periodo, setPeriodo] = useState("Histórico");
  const [aba, setAba] = useState(ABA_EVENTOS);
  const [pagina, setPagina] = useState(1);
  const [vendo, setVendo] = useState(null);

  const dias = periodos[periodo]();
  const eventos = listarEventos().filter((e) => dentroDosUltimos(e.criadoEm, dias));
  const fornecedores = listarUsuarios().filter((u) => u.perfil === "fornecedor" && u.aprovado && dentroDosUltimos(u.criadoEm, dias));
  const comStatus = (status) => eventos.filter((e) => e.status === status).length;
  const comPropostas = eventos.filter((e) => e.propostas.length > 0).length;
  const orcamentoTotal = eventos.reduce((soma, e) => soma + (e.orcamento || 0), 0);

  // ── Dados dos gráficos ──
  const porStatus = STATUS_GRAFICO.map((s) => ({ rotulo: s.status, valor: comStatus(s.status), icone: s.icone, variante: s.variante })).filter((d) => d.valor > 0);

  const somaPorCategoria = new Map();
  for (const e of eventos) somaPorCategoria.set(e.categoria, (somaPorCategoria.get(e.categoria) ?? 0) + (e.orcamento || 0));
  const porCategoria = [...somaPorCategoria.entries()]
    .map(([categoria, valor]) => ({ rotulo: categoria || "Sem categoria", valor, formatado: moedaCompacta(valor) }))
    .sort((a, b) => b.valor - a.valor);

  // Eventos por mês de realização (últimos 12 meses com eventos), em ordem cronológica.
  const contagemPorMes = new Map();
  for (const e of eventos) if (e.data) contagemPorMes.set(e.data.slice(0, 7), (contagemPorMes.get(e.data.slice(0, 7)) ?? 0) + 1);
  const porMes = [...contagemPorMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    // No eixo só o mês ("Set"), que cabe em 12 colunas; o completo ("Set 2024") vai na dica e na tabela para leitores de tela
    .map(([mes, valor]) => {
      const completo = mesAno(`${mes}-01`);
      return { rotulo: completo.slice(0, 3), rotuloLongo: completo, valor };
    });

  // Mais recentes primeiro: os cadastrados agora (com data de cadastro) e depois pela data do evento.
  const recentes = [...eventos].sort((a, b) => (b.criadoEm ?? 0) - (a.criadoEm ?? 0) || b.data.localeCompare(a.data));
  const linhas = aba === ABA_EVENTOS ? recentes : pendentes.filter((u) => u.perfil === "fornecedor");
  const totalPaginas = Math.ceil(linhas.length / POR_PAGINA);
  const naPagina = linhas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function trocarAba(nova) {
    setAba(nova);
    setPagina(1);
  }

  return (
    <>
      <TituloPagina titulo="Dashboard Administrativo" sub="Visão geral da plataforma TrocaTicket">
        <div className="tt-filtros__abas" role="group" aria-label="Período">
          {Object.keys(periodos).map((p) => (
            <Chip key={p} rotulo={p} ativo={periodo === p} onClick={() => setPeriodo(p)} redondo={false} />
          ))}
        </div>
      </TituloPagina>

      <div className="tt-grade-kpi">
        <Kpi destaque icone={CalendarPlus} rotulo="Eventos criados" valor={eventos.length.toLocaleString("pt-BR")} detalhe={periodo === "Histórico" ? "Desde o início" : periodo === "Este ano" ? "Neste ano" : `Nos últimos ${periodo}`} />
        <Kpi
          icone={ClipboardList}
          rotulo="Com propostas"
          valor={comPropostas.toLocaleString("pt-BR")}
          medidor={eventos.length ? comPropostas / eventos.length : 0}
          detalhe={eventos.length ? `${Math.round((comPropostas / eventos.length) * 100)}% dos eventos já receberam propostas` : "Nenhum evento no período"}
        />
        <Kpi icone={Wallet} rotulo="Orçamento em cotação" valor={moedaCompacta(orcamentoTotal)} detalhe={`${moeda(orcamentoTotal)} somando todos os eventos`} />
        <Kpi icone={Building2} rotulo="Fornecedores aprovados" valor={fornecedores.length.toLocaleString("pt-BR")} detalhe="Cadastros ativos no período" />
        <Kpi
          icone={UserCheck}
          rotulo="Aprovações pendentes"
          valor={carregandoPendentes ? "…" : pendentes.length.toLocaleString("pt-BR")}
          detalhe={pendentes.length ? "Cadastros aguardando revisão" : "Nenhum cadastro aguardando"}
          acao={
            pendentes.length > 0 && (
              <Btn variante="secondary" tamanho="sm" onClick={() => navigate("/admin/aprovacoes")}>
                Revisar cadastros
              </Btn>
            )
          }
        />
      </div>

      {eventos.length === 0 ? (
        <Card style={{ marginBottom: "var(--esp-6)" }}>
          <Vazio icone={Inbox} titulo="Nenhum evento neste período" texto="Escolha um período maior para ver os gráficos.">
            <Btn variante="secondary" onClick={() => setPeriodo("Histórico")}>
              Ver histórico completo
            </Btn>
          </Vazio>
        </Card>
      ) : (
        <div className="tt-graficos">
          <CartaoGrafico titulo="Eventos por status" sub={`${eventos.length} eventos no período`}>
            <GraficoBarras titulo="Eventos por status" dados={porStatus} rotuloValor="Eventos" />
          </CartaoGrafico>
          <CartaoGrafico titulo="Orçamento por categoria" sub="Soma dos orçamentos dos eventos">
            <GraficoBarras titulo="Orçamento por categoria" dados={porCategoria} rotuloValor="Orçamento" />
          </CartaoGrafico>
          <CartaoGrafico titulo="Eventos por mês" sub="Pela data de realização">
            <GraficoColunas titulo="Eventos por mês" dados={porMes} rotuloValor="Eventos" />
          </CartaoGrafico>
        </div>
      )}

      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "var(--esp-4) var(--esp-5)", borderBottom: "1px solid var(--borda)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--esp-3)" }}>
          <div className="tt-filtros__abas" role="group" aria-label="Tabela">
            {[ABA_EVENTOS, ABA_FORNECEDORES].map((t) => (
              <Chip key={t} rotulo={t} ativo={aba === t} onClick={() => trocarAba(t)} redondo={false} />
            ))}
          </div>
          <Btn variante="ghost" tamanho="sm" icone={FileDown} onClick={() => window.print()}>
            Exportar
          </Btn>
        </div>

        {aba === ABA_EVENTOS ? (
          <Tabela colunas={["Evento", "Organizador", "Data", "Propostas", "Status", ""]}>
            {naPagina.map((ev, i) => (
              <Linha key={ev.id} ultima={i === naPagina.length - 1}>
                <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>{ev.nome}</Celula>
                <Celula style={{ color: "var(--texto-2)" }}>{ev.organizador ?? "—"}</Celula>
                <Celula style={{ color: "var(--texto-suave)" }}>{dataCurta(ev.data)}</Celula>
                <Celula style={{ fontWeight: 700, color: ev.propostas.length ? "var(--azul-texto)" : "var(--texto-suave)", fontVariantNumeric: "tabular-nums" }}>{ev.propostas.length}</Celula>
                <Celula>
                  <StatusBadge status={ev.status} />
                </Celula>
                <Celula>
                  <Btn variante="ghost" tamanho="sm" onClick={() => setVendo(ev)}>
                    Ver detalhes
                  </Btn>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        ) : (
          <Tabela colunas={["Fornecedor", "E-mail", "Aguardando", "Status", ""]}>
            {naPagina.map((u, i) => (
              <Linha key={u.id} ultima={i === naPagina.length - 1}>
                <Celula style={{ fontWeight: 600, color: "var(--texto)" }}>{u.nome}</Celula>
                <Celula style={{ color: "var(--texto-2)" }}>{u.email}</Celula>
                <Celula style={{ color: "var(--texto-suave)" }}>{u.criadoEm ? tempoDesde(u.criadoEm) : "—"}</Celula>
                <Celula>
                  <StatusBadge status="Aguardando Aprovação" />
                </Celula>
                <Celula>
                  <Btn tamanho="sm" onClick={() => navigate("/admin/aprovacoes")}>
                    Revisar
                  </Btn>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        )}

        {linhas.length === 0 && (
          <Vazio
            icone={aba === ABA_EVENTOS ? Inbox : CircleCheck}
            titulo={aba === ABA_EVENTOS ? "Nenhum evento neste período" : "Nenhum fornecedor aguardando"}
            texto={aba === ABA_EVENTOS ? "Os eventos cadastrados no período aparecem aqui." : "Todos os cadastros de fornecedores foram revisados."}
          />
        )}

        <Paginacao pagina={pagina} total={totalPaginas} onChange={setPagina} />
      </Card>

      {vendo && (
        <Modal onClose={() => setVendo(null)}>
          <CabecalhoModal onFechar={() => setVendo(null)}>
            <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)" }}>{vendo.nome}</h3>
          </CabecalhoModal>
          <ListaDetalhes
            itens={[
              { rotulo: "Organizador", valor: vendo.organizador ?? "—" },
              { rotulo: "Data", valor: dataCurta(vendo.data) },
              { rotulo: "Local", valor: vendo.local || "—" },
              { rotulo: "Categoria", valor: vendo.categoria },
              { rotulo: "Orçamento", valor: moeda(vendo.orcamento) },
              { rotulo: "Propostas", valor: `${vendo.propostas.length} recebidas` },
              { rotulo: "Status", valor: vendo.status },
            ]}
          />
          <Btn style={{ width: "100%" }} onClick={() => setVendo(null)}>
            Fechar
          </Btn>
        </Modal>
      )}
    </>
  );
}
