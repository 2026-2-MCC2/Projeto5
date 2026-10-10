import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, Badge, Btn, Chip, Estrelas, Modal, TituloPagina, Valor } from "../../components/ui";
import { buscarEvento, salvarSelecao } from "../../services/organizadorService";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { moeda } from "../../utils/formatar";

const TODAS = "Todos";
const filtros = [TODAS, ...CATEGORIAS_FORNECEDOR];

const ordenacoes = {
  "Recomendados (Custo-Benefício)": (a, b) => Number(Boolean(b.recomendado)) - Number(Boolean(a.recomendado)) || b.nota - a.nota,
  "Menor preço": (a, b) => a.valor - b.valor,
  "Maior avaliação": (a, b) => b.nota - a.nota,
  "Mais avaliações": (a, b) => b.avaliacoes - a.avaliacoes,
};

export default function Propostas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEvento(Number(id));
  const [filtro, setFiltro] = useState(TODAS);
  const [ordem, setOrdem] = useState(Object.keys(ordenacoes)[0]);
  const [mostrarOrdem, setMostrarOrdem] = useState(false);
  const [selecionadas, setSelecionadas] = useState(() => evento?.selecionadas ?? []);
  const [aberta, setAberta] = useState(null);

  if (!evento) return <Navigate to="/organizador" replace />;

  const visiveis = evento.propostas.filter((p) => filtro === TODAS || p.categoria === filtro).sort(ordenacoes[ordem]);
  const total = evento.propostas.filter((p) => selecionadas.includes(p.id)).reduce((soma, p) => soma + p.valor, 0);

  // Só uma proposta por categoria: escolher outra da mesma categoria troca a anterior.
  function alternar(proposta) {
    setSelecionadas((atuais) => {
      if (atuais.includes(proposta.id)) return atuais.filter((x) => x !== proposta.id);
      const outrasCategorias = atuais.filter((x) => evento.propostas.find((p) => p.id === x).categoria !== proposta.categoria);
      return [...outrasCategorias, proposta.id];
    });
  }

  function verResultado() {
    salvarSelecao(evento.id, selecionadas);
    navigate(`/organizador/eventos/${evento.id}/resultado`);
  }

  return (
    <>
      <TituloPagina titulo="Comparação de Propostas" sub={`${evento.propostas.length} propostas recebidas · ${evento.nome}`}>
        <Btn variante="ghost" tamanho="sm" onClick={() => window.print()}>
          📄 Exportar PDF
        </Btn>
      </TituloPagina>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filtros.map((f) => (
            <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMostrarOrdem(!mostrarOrdem)}
            style={{ padding: "7px 13px", borderRadius: "8px", background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#6B7280", fontSize: "0.8125rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            ↕ <strong style={{ color: "#374151" }}>{ordem.split("(")[0].trim()}</strong>
          </button>
          {mostrarOrdem && (
            <div
              onMouseLeave={() => setMostrarOrdem(false)}
              style={{ position: "absolute", right: 0, top: "calc(100% + 5px)", background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", zIndex: 30, minWidth: "230px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
            >
              {Object.keys(ordenacoes).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    setOrdem(o);
                    setMostrarOrdem(false);
                  }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: ordem === o ? "#F9FAFB" : "transparent", border: "none", color: ordem === o ? "#2563EB" : "#6B7280", fontSize: "0.8125rem", cursor: "pointer" }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px", marginBottom: "6rem" }}>
        {visiveis.map((p) => {
          const marcada = selecionadas.includes(p.id);
          return (
            <Card key={p.id} variante={marcada ? "selecionado" : "padrao"} style={{ padding: "1.125rem 1.5rem", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  aria-label={marcada ? "Desmarcar proposta" : "Selecionar proposta"}
                  onClick={() => alternar(p)}
                  style={{ width: "20px", height: "20px", borderRadius: "5px", background: marcada ? "#2563EB" : "#FFFFFF", border: `2px solid ${marcada ? "#2563EB" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", fontSize: "0.6875rem", color: "#fff", fontWeight: 700, flexShrink: 0, padding: 0 }}
                >
                  {marcada && "✓"}
                </button>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{p.fornecedor}</span>
                    {p.recomendado && <Badge variante="success">⭐ Recomendado</Badge>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", flexWrap: "wrap" }}>
                    <Estrelas nota={p.nota} />
                    <span style={{ color: "#9CA3AF" }}>({p.avaliacoes} avaliações)</span>
                    <Badge>{p.categoria}</Badge>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Valor cor="#111827" tamanho="1.1875rem" peso={700}>
                    {moeda(p.valor)}
                  </Valor>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>valor total</div>
                </div>
                <Btn variante="secondary" tamanho="sm" onClick={() => setAberta(p)}>
                  Ver proposta completa
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFFFFF", borderTop: "1px solid #E5E7EB", padding: "1rem 1.5rem", zIndex: 50, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontFamily: "Outfit", fontWeight: 600, color: "#6B7280" }}>
              {selecionadas.length} {selecionadas.length === 1 ? "proposta selecionada" : "propostas selecionadas"}
            </span>
            {total > 0 && (
              <Valor cor="#111827" tamanho="1.0625rem" peso={700}>
                TOTAL: {moeda(total)}
              </Valor>
            )}
          </div>
          <Btn onClick={verResultado} disabled={selecionadas.length === 0}>
            Ver Resultado da Composição →
          </Btn>
        </div>
      </div>

      {aberta && (
        <Modal onClose={() => setAberta(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontFamily: "Outfit", fontSize: "1.0625rem", fontWeight: 700, color: "#111827" }}>{aberta.fornecedor}</h3>
              <Estrelas nota={aberta.nota} />
            </div>
            <button type="button" aria-label="Fechar" onClick={() => setAberta(null)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "1.25rem" }}>
              ✕
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.25rem" }}>
            {aberta.itens.map((item) => (
              <div key={item.descricao} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 12px", background: "#F9FAFB", borderRadius: "8px", fontSize: "0.875rem" }}>
                <span style={{ color: "#374151" }}>
                  {item.descricao} <span style={{ color: "#9CA3AF" }}>· {item.quantidade} {item.unidade}</span>
                </span>
                <Valor>{moeda(item.preco)}</Valor>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#F0FDF4", border: "1px solid rgba(5,150,105,0.2)", borderRadius: "9px", marginBottom: "1.25rem" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>Total</span>
            <Valor tamanho="1.125rem" peso={700}>
              {moeda(aberta.valor)}
            </Valor>
          </div>
          <Btn
            style={{ width: "100%" }}
            onClick={() => {
              alternar(aberta);
              setAberta(null);
            }}
          >
            {selecionadas.includes(aberta.id) ? "✓ Selecionada (clique para desmarcar)" : "Selecionar esta proposta"}
          </Btn>
        </Modal>
      )}
    </>
  );
}
