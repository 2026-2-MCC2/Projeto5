import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Activity, Building2, CalendarPlus, CircleCheck, ClipboardList, Clock, FileDown } from "lucide-react";
import { Card, Btn, CabecalhoModal, Icone, Chip, ListaDetalhes, Modal, StatusBadge, TituloPagina, Tabela, Linha, Celula } from "../../components/ui";
import { listarEventos } from "../../services/organizadorService";
import { listarUsuarios } from "../../services/authService";
import { dataCurta, dentroDosUltimos, moeda, tempoDesde } from "../../utils/formatar";

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

function CardIndicador({ icone, rotulo, valor, cor }) {
  return (
    <Card style={{ padding: "1.25rem 1.5rem" }}>
      <Icone icone={icone} tamanho={20} style={{ color: cor, marginBottom: "10px" }} />
      <div style={{ fontFamily: "Outfit", fontSize: "2rem", fontWeight: 800, color: cor, lineHeight: 1, marginBottom: "4px" }}>{valor}</div>
      <div style={{ fontSize: "0.8125rem", color: "#9CA3AF", fontWeight: 500 }}>{rotulo}</div>
    </Card>
  );
}

function Paginacao({ pagina, total, onChange }) {
  if (total <= 1) return null;
  const estilo = (ativo) => ({ padding: "7px 12px", borderRadius: "7px", background: ativo ? "#EFF6FF" : "#FFFFFF", border: `1px solid ${ativo ? "#BFDBFE" : "#E5E7EB"}`, color: ativo ? "#1D4ED8" : "#6B7280", fontSize: "0.8125rem", cursor: "pointer" });
  return (
    <div style={{ padding: "14px 16px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "center", gap: "6px" }}>
      <button type="button" style={estilo(false)} onClick={() => onChange(Math.max(1, pagina - 1))}>
        Anterior
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" style={estilo(pagina === n)} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
      <button type="button" style={estilo(false)} onClick={() => onChange(Math.min(total, pagina + 1))}>
        Próximo
      </button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { pendentes } = useOutletContext();
  const [periodo, setPeriodo] = useState("Histórico");
  const [aba, setAba] = useState(ABA_EVENTOS);
  const [pagina, setPagina] = useState(1);
  const [vendo, setVendo] = useState(null);

  const dias = periodos[periodo]();
  const eventos = listarEventos().filter((e) => dentroDosUltimos(e.criadoEm, dias));
  const fornecedores = listarUsuarios().filter((u) => u.perfil === "fornecedor" && u.aprovado && dentroDosUltimos(u.criadoEm, dias));
  const comStatus = (status) => eventos.filter((e) => e.status === status).length;

  const indicadores = [
    { rotulo: "Eventos Criados", valor: eventos.length, cor: "#2563EB", icone: CalendarPlus },
    { rotulo: "Com Propostas", valor: eventos.filter((e) => e.propostas.length > 0).length, cor: "#059669", icone: ClipboardList },
    { rotulo: "Em Andamento", valor: comStatus("Em andamento"), cor: "#D97706", icone: Activity },
    { rotulo: "Aguardando Data", valor: comStatus("Aguardando Data"), cor: "#6B7280", icone: Clock },
    { rotulo: "Concluídos", valor: comStatus("Concluído"), cor: "#059669", icone: CircleCheck },
    { rotulo: "Fornecedores", valor: fornecedores.length, cor: "#EA580C", icone: Building2 },
  ];

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
        <div style={{ display: "flex", gap: "6px" }}>
          {Object.keys(periodos).map((p) => (
            <Chip key={p} rotulo={p} ativo={periodo === p} onClick={() => setPeriodo(p)} redondo={false} />
          ))}
        </div>
      </TituloPagina>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {indicadores.map((k) => (
          <CardIndicador key={k.rotulo} {...k} />
        ))}
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
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
                <Celula style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{ev.nome}</Celula>
                <Celula style={{ fontSize: "0.875rem", color: "#6B7280" }}>{ev.organizador ?? "—"}</Celula>
                <Celula style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>{dataCurta(ev.data)}</Celula>
                <Celula style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "0.9375rem", color: "#2563EB" }}>{ev.propostas.length}</Celula>
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
                <Celula style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{u.nome}</Celula>
                <Celula style={{ fontSize: "0.8125rem", color: "#6B7280" }}>{u.email}</Celula>
                <Celula style={{ fontSize: "0.8125rem", color: "#6B7280" }}>{u.criadoEm ? tempoDesde(u.criadoEm) : "—"}</Celula>
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
          <p style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF", fontSize: "0.875rem" }}>
            {aba === ABA_EVENTOS ? "Nenhum evento cadastrado neste período" : "Nenhum fornecedor aguardando aprovação"}
          </p>
        )}

        <Paginacao pagina={pagina} total={totalPaginas} onChange={setPagina} />
      </Card>

      {vendo && (
        <Modal onClose={() => setVendo(null)}>
          <CabecalhoModal onFechar={() => setVendo(null)}>
            <h3 style={{ fontFamily: "Outfit", fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>{vendo.nome}</h3>
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
