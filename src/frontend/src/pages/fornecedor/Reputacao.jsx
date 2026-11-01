import { useState } from "react";
import { ChevronDown, ChevronUp, Flag, MessageSquareText } from "lucide-react";
import { Card, Btn, Chip, Estrelas, Modal, TextArea, TituloPagina, Vazio } from "../../components/ui";
import { CartaoGrafico, GraficoBarras } from "../../components/painel";
import "../../components/organizador.css";
import { listarAvaliacoes, listarDesempenho } from "../../services/fornecedorService";
import { mesAno } from "../../utils/formatar";

const ordenacoes = {
  Todos: () => 0,
  Recentes: (a, b) => b.data.localeCompare(a.data),
  "Melhor avaliadas": (a, b) => b.nota - a.nota,
};

export default function Reputacao() {
  const avaliacoes = listarAvaliacoes();
  const [ordem, setOrdem] = useState("Todos");
  const [abertas, setAbertas] = useState([]);
  const [contestando, setContestando] = useState(null);
  const [motivo, setMotivo] = useState("");

  const ordenadas = [...avaliacoes].sort(ordenacoes[ordem]);
  const media = avaliacoes.length ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length : 0;
  const distribuicao = [5, 4, 3, 2, 1].map((estrela) => {
    const quantidade = avaliacoes.filter((a) => a.nota === estrela).length;
    return { rotulo: estrela === 1 ? "1 estrela" : `${estrela} estrelas`, valor: quantidade };
  });
  const umaCasa = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const desempenho = listarDesempenho().map((m) => ({ rotulo: m.criterio, valor: m.nota, formatado: umaCasa(m.nota) }));

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

      {avaliacoes.length === 0 ? (
        <Card>
          <Vazio icone={MessageSquareText} titulo="Você ainda não recebeu avaliações" texto="Depois de cada evento, o organizador pode avaliar o seu serviço. As notas aparecem aqui." />
        </Card>
      ) : (
        <div className="tt-coluna-esquerda">
          <div className="tt-detalhes__lateral">
            <Card style={{ padding: "var(--esp-6)" }}>
              <span className="tt-rotulo">Nota média</span>
              <div className="tt-nota-media">
                <strong>{umaCasa(media)}</strong>
                <span>de 5</span>
              </div>
              <Estrelas nota={media} />
              <p style={{ marginTop: "var(--esp-3)", fontSize: "var(--tam-sm)", color: "var(--texto-suave)" }}>
                Baseada em {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"} de organizadores
              </p>
            </Card>

            <CartaoGrafico titulo="Distribuição das notas" sub="Quantidade de avaliações por nota">
              <GraficoBarras titulo="Distribuição das notas" dados={distribuicao} rotuloValor="Avaliações" />
            </CartaoGrafico>

            <CartaoGrafico titulo="Desempenho por critério" sub="Média de 0 a 5">
              <GraficoBarras titulo="Desempenho por critério" dados={desempenho} rotuloValor="Nota" maximo={5} />
            </CartaoGrafico>
          </div>

          <div>
            <div className="tt-filtros">
              <div className="tt-filtros__abas" role="group" aria-label="Ordenar avaliações">
                {Object.keys(ordenacoes).map((o) => (
                  <Chip key={o} rotulo={o} ativo={ordem === o} onClick={() => setOrdem(o)} redondo={false} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--esp-3)" }}>
              {ordenadas.map((a) => {
                const aberta = abertas.includes(a.id);
                return (
                  <Card key={a.id} style={{ padding: "var(--esp-5) var(--esp-6)" }}>
                    <article>
                      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--esp-3)", flexWrap: "wrap", marginBottom: "var(--esp-3)" }}>
                        <div>
                          <h3 style={{ fontSize: "var(--tam-md)", fontWeight: 600, color: "var(--texto)", marginBottom: 2 }}>{a.evento}</h3>
                          <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)" }}>
                            Avaliado por {a.organizador} em {mesAno(a.data)}
                          </p>
                        </div>
                        <Estrelas nota={a.nota} />
                      </header>
                      <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-2)", lineHeight: 1.6, marginBottom: "var(--esp-4)" }}>{aberta ? a.comentario : a.resumo}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--esp-2)" }}>
                        <Btn variante="ghost" tamanho="sm" icone={aberta ? ChevronUp : ChevronDown} onClick={() => alternar(a.id)}>
                          {aberta ? "Recolher" : "Ver comentário completo"}
                        </Btn>
                        <Btn variante="ghost" tamanho="sm" icone={Flag} onClick={() => setContestando(a.id)}>
                          Contestar avaliação
                        </Btn>
                      </div>
                    </article>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {contestando !== null && (
        <Modal onClose={fecharContestacao}>
          <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-2)" }}>Contestar avaliação</h3>
          <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>Descreva o motivo da contestação. Nossa equipe analisará em até 5 dias úteis.</p>
          <TextArea placeholder="Explique o motivo da contestação..." value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ marginBottom: "var(--esp-4)" }} />
          <div style={{ display: "flex", gap: "var(--esp-3)" }}>
            <Btn variante="secondary" style={{ flex: 1 }} onClick={fecharContestacao}>
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
