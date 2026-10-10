import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, ClipboardList, MapPin, Users } from "lucide-react";
import { Card, Badge, Btn, Chip, CampoBusca, TextoComIcone, TituloPagina, Valor, Vazio } from "../../components/ui";
import { listarEventos } from "../../services/fornecedorService";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { dataCurta, faixaMoeda } from "../../utils/formatar";

const TODAS = "Todas as Ofertas";
const filtros = [TODAS, ...CATEGORIAS_FORNECEDOR];

export default function Oportunidades() {
  const navigate = useNavigate();
  const eventos = listarEventos();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState(TODAS);

  const termo = busca.toLowerCase();
  const filtrados = eventos.filter((e) => {
    const casaBusca = !termo || e.nome.toLowerCase().includes(termo) || e.categoria.toLowerCase().includes(termo);
    const casaFiltro = filtro === TODAS || e.necessidades.includes(filtro);
    return casaBusca && casaFiltro;
  });

  return (
    <>
      <TituloPagina titulo="Eventos Disponíveis para Cotação" sub={`${eventos.length} oportunidades abertas para sua categoria`} />

      <Card style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem" }}>
        <CampoBusca placeholder="Buscar por nome, categoria..." valor={busca} onChange={setBusca} />
      </Card>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {filtros.map((f) => (
          <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
        ))}
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {filtrados.map((ev) => (
          <Card key={ev.id} style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <h3 style={{ fontFamily: "Outfit", fontSize: "1.0625rem", fontWeight: 700, color: "#111827" }}>{ev.nome}</h3>
                  <Badge>{ev.categoria}</Badge>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "12px", flexWrap: "wrap" }}>
                  <TextoComIcone icone={Calendar}>{dataCurta(ev.data)}</TextoComIcone>
                  <TextoComIcone icone={MapPin}>{ev.local}</TextoComIcone>
                  <TextoComIcone icone={Users}>{ev.convidados.toLocaleString("pt-BR")} convidados</TextoComIcone>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {ev.necessidades.map((n) => (
                    <span key={n} style={{ fontSize: "0.6875rem", padding: "3px 8px", borderRadius: "4px", background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#6B7280" }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0, gap: "12px" }}>
                <div style={{ textAlign: "right" }}>
                  <Valor tamanho="0.9375rem" peso={700}>
                    {faixaMoeda(ev.orcamento)}
                  </Valor>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>Prazo: {dataCurta(ev.prazo)}</div>
                </div>
                <Btn tamanho="sm" iconeDepois={ArrowRight} onClick={() => navigate(`/fornecedor/eventos/${ev.id}`)}>
                  Ver Detalhes &amp; Cotar
                </Btn>
              </div>
            </div>
          </Card>
        ))}

        {filtrados.length === 0 && <Vazio icone={ClipboardList} texto="Nenhum evento encontrado para esta busca" />}
      </div>
    </>
  );
}
