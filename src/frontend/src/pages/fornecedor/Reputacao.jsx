import { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { Card, CardTitulo, Icone, TextoComIcone, Btn, Chip, Estrelas, Modal, TextArea, TituloPagina, BarraProgresso, BarraRotulada } from "../../components/ui";
import { listarAvaliacoes, listarDesempenho } from "../../services/fornecedorService";
import { mesAno } from "../../utils/formatar";

const ordenacoes = {
  Todos: () => 0,
  Recentes: (a, b) => b.data.localeCompare(a.data),
  "Melhor avaliadas": (a, b) => b.nota - a.nota,
};

const estiloLinkTexto = { background: "none", border: "none", padding: 0, fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" };

export default function Reputacao() {
  const avaliacoes = listarAvaliacoes();
  const [ordem, setOrdem] = useState("Todos");
  const [abertas, setAbertas] = useState([]);
  const [contestando, setContestando] = useState(null);
  const [motivo, setMotivo] = useState("");

  const ordenadas = [...avaliacoes].sort(ordenacoes[ordem]);
  const media = avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length;
  const distribuicao = [5, 4, 3, 2, 1].map((estrela) => {
    const quantidade = avaliacoes.filter((a) => a.nota === estrela).length;
    return { estrela, quantidade, porcentagem: (quantidade / avaliacoes.length) * 100 };
  });

  function alternar(id) {
    setAbertas(abertas.includes(id) ? abertas.filter((x) => x !== id) : [...abertas, id]);
  }

  function fecharContestacao() {
    setContestando(null);
    setMotivo("");
  }

  return (
    <>
      <TituloPagina titulo="Minha Reputação & Avaliações" sub="Histórico completo de avaliações dos organizadores" />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card style={{ padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontFamily: "Outfit", fontSize: "4rem", fontWeight: 900, color: "#2563EB", lineHeight: 1 }}>{media.toFixed(1)}</div>
            <div style={{ marginTop: "8px", marginBottom: "12px" }}>
              <Estrelas nota={media} />
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>Baseado em {avaliacoes.length} avaliações</div>
          </Card>

          <Card style={{ padding: "1.25rem" }}>
            <CardTitulo>Distribuição</CardTitulo>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {distribuicao.map((d) => (
                <div key={d.estrela} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem" }}>
                  <TextoComIcone icone={Star} tamanho={14} style={{ color: "#D97706", width: "30px", justifyContent: "flex-end", flexShrink: 0, gap: "3px", flexDirection: "row-reverse" }}>
                    {d.estrela}
                  </TextoComIcone>
                  <BarraProgresso porcentagem={d.porcentagem} cor="#D97706" />
                  <span style={{ color: "#9CA3AF", width: "24px", textAlign: "right", flexShrink: 0 }}>{d.quantidade}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: "1.25rem" }}>
            <CardTitulo>Desempenho</CardTitulo>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {listarDesempenho().map((m) => (
                <BarraRotulada key={m.criterio} rotulo={m.criterio} valor={m.nota} porcentagem={(m.nota / 5) * 100} altura="5px" />
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.25rem" }}>
            {Object.keys(ordenacoes).map((o) => (
              <Chip key={o} rotulo={o} ativo={ordem === o} onClick={() => setOrdem(o)} redondo={false} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ordenadas.map((a) => {
              const aberta = abertas.includes(a.id);
              return (
                <Card key={a.id} style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{a.evento}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>
                        por {a.organizador} · {mesAno(a.data)}
                      </div>
                    </div>
                    <Estrelas nota={a.nota} />
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.6, marginBottom: "10px" }}>{aberta ? a.comentario : a.resumo}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button type="button" className="tt-link" aria-expanded={aberta} onClick={() => alternar(a.id)} style={{ ...estiloLinkTexto, color: "#9CA3AF" }}>
                      <Icone icone={aberta ? ChevronUp : ChevronDown} tamanho={16} />
                      {aberta ? "Recolher" : "Ver comentário completo"}
                    </button>
                    <button type="button" className="tt-link" onClick={() => setContestando(a.id)} style={{ ...estiloLinkTexto, color: "#DC2626" }}>
                      Contestar Avaliação
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {contestando !== null && (
        <Modal onClose={fecharContestacao}>
          <h3 style={{ fontFamily: "Outfit", fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Contestar Avaliação</h3>
          <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "16px" }}>Descreva o motivo da contestação. Nossa equipe analisará em até 5 dias úteis.</p>
          <TextArea placeholder="Explique o motivo da contestação..." value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variante="ghost" style={{ flex: 1 }} onClick={fecharContestacao}>
              Cancelar
            </Btn>
            <Btn style={{ flex: 1 }} onClick={fecharContestacao}>
              Enviar Contestação
            </Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
