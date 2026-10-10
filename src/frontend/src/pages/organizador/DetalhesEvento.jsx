import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, CardTitulo, CabecalhoCard, Btn, Indicador, ListaInfo, StatusBadge, TituloPagina, Tabela, Linha, Celula, RodapeCard, Valor, Vazio } from "../../components/ui";
import EditorItens from "../../components/EditorItens";
import { buscarEvento, salvarItens, somaEstimado } from "../../services/organizadorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd.", "Unidade", "Custo Estimado", "Valor Acordado"];

export default function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(() => buscarEvento(Number(id)));
  const [itensEditados, setItensEditados] = useState(null);

  if (!evento) return <Navigate to="/organizador" replace />;

  const editando = itensEditados !== null;
  const itens = editando ? itensEditados : evento.itens;
  const totalEstimado = somaEstimado(itens);
  const comAcordo = itens.filter((i) => i.acordado !== null);
  const totalAcordado = comAcordo.reduce((soma, i) => soma + i.acordado, 0);
  const economia = comAcordo.reduce((soma, i) => soma + i.estimado - i.acordado, 0);
  const estimadoComAcordo = somaEstimado(comAcordo);

  function salvar() {
    salvarItens(evento.id, itensEditados);
    setEvento(buscarEvento(evento.id));
    setItensEditados(null);
  }

  const info = [
    { rotulo: "Categoria", valor: evento.categoria },
    { rotulo: "Data", valor: dataCurta(evento.data) },
    { rotulo: "Local", valor: evento.local || "—" },
    { rotulo: "Convidados", valor: `${evento.convidados.toLocaleString("pt-BR")} pessoas` },
    { rotulo: "Orçamento", valor: moeda(evento.orcamento) },
  ];

  return (
    <>
      <TituloPagina
        titulo={evento.nome}
        extra={<StatusBadge status={evento.status} />}
        sub={`📅 ${dataCurta(evento.data)} · 📍 ${evento.local || "—"} · 👥 ${evento.convidados.toLocaleString("pt-BR")} convidados`}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {editando ? (
            <>
              <Btn variante="ghost" onClick={() => setItensEditados(null)}>
                Descartar
              </Btn>
              <Btn onClick={salvar}>✓ Salvar</Btn>
            </>
          ) : (
            <Btn variante="secondary" onClick={() => setItensEditados(evento.itens)}>
              ✏️ Editar Itens
            </Btn>
          )}
        </div>
      </TituloPagina>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        <Card style={{ overflow: "hidden" }}>
          <CabecalhoCard titulo={editando ? "✏️ Editar Itens do Evento" : "Itens do Evento"} />

          {editando ? (
            <EditorItens itens={itensEditados} onChange={setItensEditados} comAcordado />
          ) : itens.length === 0 ? (
            <Vazio icone="🧾" texto="Nenhum item cadastrado. Clique em Editar Itens para adicionar." />
          ) : (
            <>
              <Tabela colunas={colunas}>
                {itens.map((item, i) => (
                  <Linha key={item.id} ultima={i === itens.length - 1}>
                    <Celula style={{ fontSize: "0.875rem", color: "#111827" }}>{item.descricao}</Celula>
                    <Celula>
                      <Valor cor="#6B7280" peso={400}>
                        {item.quantidade}
                      </Valor>
                    </Celula>
                    <Celula style={{ fontSize: "0.875rem", color: "#6B7280" }}>{item.unidade}</Celula>
                    <Celula>
                      <Valor cor="#9CA3AF" peso={400}>
                        {moeda(item.estimado)}
                      </Valor>
                    </Celula>
                    <Celula>
                      <Valor cor={item.acordado === null ? "#9CA3AF" : "#059669"}>{item.acordado === null ? "—" : moeda(item.acordado)}</Valor>
                    </Celula>
                  </Linha>
                ))}
              </Tabela>
              <RodapeCard>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#6B7280" }}>Total</span>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <Valor cor="#9CA3AF" peso={400} riscado={totalAcordado > 0}>
                    {moeda(totalEstimado)}
                  </Valor>
                  {totalAcordado > 0 && (
                    <Valor tamanho="1.125rem" peso={700}>
                      {moeda(totalAcordado)}
                    </Valor>
                  )}
                </div>
              </RodapeCard>
            </>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h4 style={{ fontFamily: "Outfit", fontWeight: 700, color: "#111827", fontSize: "0.9375rem" }}>Propostas Comerciais</h4>
              <span style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 800, color: "#2563EB" }}>{evento.propostas.length}</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "14px", lineHeight: 1.5 }}>
              {evento.propostas.length > 0
                ? `${evento.propostas.length} propostas comerciais recebidas de fornecedores qualificados`
                : "Nenhuma proposta recebida até agora"}
            </p>
            <Btn style={{ width: "100%" }} disabled={evento.propostas.length === 0} onClick={() => navigate(`/organizador/eventos/${evento.id}/propostas`)}>
              Ver Propostas →
            </Btn>
          </Card>

          <Card style={{ padding: "1.25rem" }}>
            <CardTitulo>Informações do Evento</CardTitulo>
            <ListaInfo itens={info} />
          </Card>

          {comAcordo.length > 0 && (
            <Indicador
              variante="sucesso"
              rotulo="Economia Obtida"
              valor={moeda(economia)}
              cor="#059669"
              detalhe={`${((Math.abs(economia) / estimadoComAcordo) * 100).toFixed(1)}% ${economia >= 0 ? "abaixo" : "acima"} do estimado`}
            />
          )}
        </div>
      </div>
    </>
  );
}
