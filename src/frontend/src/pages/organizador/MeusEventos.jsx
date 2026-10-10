import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Btn, Chip, CampoBusca, StatusBadge, TituloPagina, Valor, Vazio } from "../../components/ui";
import { listarEventos } from "../../services/organizadorService";
import { dataCurta, moeda } from "../../utils/formatar";

const abas = [
  { rotulo: "Todos", filtro: () => true },
  { rotulo: "Em andamento", filtro: (e) => e.status === "Em andamento" },
  { rotulo: "Concluídos", filtro: (e) => e.status === "Concluído" },
];

export default function MeusEventos() {
  const navigate = useNavigate();
  const eventos = listarEventos();
  const [aba, setAba] = useState(abas[0]);
  const [busca, setBusca] = useState("");

  const termo = busca.toLowerCase();
  const filtrados = eventos.filter(
    (e) => aba.filtro(e) && (!termo || e.nome.toLowerCase().includes(termo) || e.local.toLowerCase().includes(termo))
  );

  return (
    <>
      <TituloPagina titulo="Meus Eventos" sub={`${eventos.length} eventos cadastrados`}>
        <Btn onClick={() => navigate("/organizador/eventos/novo")}>+ Criar Evento</Btn>
      </TituloPagina>

      <Card style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <CampoBusca placeholder="Buscar por nome ou local..." valor={busca} onChange={setBusca} />
          <div style={{ display: "flex", gap: "4px" }}>
            {abas.map((a) => (
              <Chip key={a.rotulo} rotulo={`${a.rotulo} (${eventos.filter(a.filtro).length})`} ativo={aba === a} onClick={() => setAba(a)} redondo={false} />
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gap: "10px" }}>
        {filtrados.map((ev) => (
          <Card key={ev.id} style={{ padding: "1.125rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                  <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{ev.nome}</h3>
                  <StatusBadge status={ev.status} />
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.8125rem", color: "#9CA3AF", flexWrap: "wrap" }}>
                  <span>📅 {dataCurta(ev.data)}</span>
                  <span>📍 {ev.local}</span>
                  <Valor cor="#6B7280" tamanho="0.8125rem" peso={400}>
                    {moeda(ev.orcamento)}
                  </Valor>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 700, color: "#2563EB" }}>{ev.propostas.length}</div>
                  <div style={{ fontSize: "0.6875rem", color: "#9CA3AF", marginTop: "1px" }}>propostas</div>
                </div>
                <Badge>{ev.categoria}</Badge>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <Btn variante="secondary" tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}`)}>
                  Detalhes
                </Btn>
                {ev.status === "Em andamento" && ev.propostas.length > 0 && (
                  <Btn tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}/propostas`)}>
                    Propostas
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filtrados.length === 0 && <Vazio icone="🔍" texto="Nenhum evento encontrado" />}
      </div>
    </>
  );
}
