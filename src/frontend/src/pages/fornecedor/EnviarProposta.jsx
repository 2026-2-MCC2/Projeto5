import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, CardTitulo, Rotulo, Btn, Input, TextArea, Modal, TituloPagina, Tabela, Linha, Celula } from "../../components/ui";
import { buscarEvento, enviarProposta } from "../../services/fornecedorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd. Solicitada", "Unidade", "Preço Ofertado (unit.)", "Subtotal"];

const estiloValor = { fontFamily: "JetBrains Mono", fontWeight: 700, color: "#059669" };

export default function EnviarProposta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEvento(Number(id));
  const [precos, setPrecos] = useState(() => (evento ? evento.itens.map(() => 0) : []));
  const [observacoes, setObservacoes] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  if (!evento) return <Navigate to="/fornecedor" replace />;

  const total = evento.itens.reduce((soma, item, i) => soma + precos[i] * item.quantidade, 0);
  const podeEnviar = precos.every((p) => p > 0);

  function alterarPreco(indice, valor) {
    setPrecos(precos.map((p, i) => (i === indice ? Number(valor) : p)));
  }

  function enviar() {
    enviarProposta({ evento, valor: total, observacoes });
    navigate("/fornecedor/propostas");
  }

  const resumo = [
    { rotulo: "Organizador", valor: evento.organizador },
    { rotulo: "Data", valor: dataCurta(evento.data) },
    { rotulo: "Local", valor: evento.local },
    { rotulo: "Convidados", valor: `${evento.convidados.toLocaleString("pt-BR")} pessoas` },
    { rotulo: "Prazo para envio", valor: dataCurta(evento.prazo) },
  ];

  return (
    <>
      <TituloPagina titulo={evento.nome} sub={`${evento.necessidades[0]} · ${dataCurta(evento.data)} · ${evento.local}`} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        <div>
          <Card style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E5E7EB" }}>
              <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>Formulário de Proposta</h3>
              <p style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginTop: "4px" }}>Preencha o preço ofertado para cada item solicitado</p>
            </div>

            <Tabela colunas={colunas}>
              {evento.itens.map((item, i) => (
                <Linha key={item.descricao} ultima={i === evento.itens.length - 1}>
                  <Celula style={{ fontSize: "0.875rem", color: "#111827" }}>{item.descricao}</Celula>
                  <Celula style={{ fontFamily: "JetBrains Mono", fontSize: "0.875rem", color: "#6B7280" }}>{item.quantidade}</Celula>
                  <Celula style={{ fontSize: "0.875rem", color: "#6B7280" }}>{item.unidade}</Celula>
                  <Celula>
                    <div style={{ position: "relative", width: "130px" }}>
                      <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#9CA3AF", pointerEvents: "none" }}>R$</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0,00"
                        value={precos[i] || ""}
                        onChange={(e) => alterarPreco(i, e.target.value)}
                        destacado={precos[i] > 0}
                        style={{ padding: "7px 10px 7px 28px", borderRadius: "7px", fontSize: "0.8125rem", fontFamily: "JetBrains Mono" }}
                      />
                    </div>
                  </Celula>
                  <Celula style={{ fontFamily: "JetBrains Mono", fontSize: "0.875rem", fontWeight: 600, color: precos[i] > 0 ? "#059669" : "#9CA3AF" }}>
                    {precos[i] > 0 ? moeda(precos[i] * item.quantidade) : "—"}
                  </Celula>
                </Linha>
              ))}
            </Tabela>

            <div style={{ padding: "14px 16px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Outfit", fontWeight: 700, color: "#374151" }}>VALOR TOTAL DA PROPOSTA</span>
              <span style={{ ...estiloValor, fontSize: "1.375rem" }}>{total > 0 ? moeda(total) : "—"}</span>
            </div>
          </Card>

          <Card style={{ padding: "1.25rem 1.5rem" }}>
            <CardTitulo>Observações (opcional)</CardTitulo>
            <TextArea
              placeholder="Adicione informações adicionais, condições especiais, validade da proposta, etc."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card style={{ padding: "1.25rem" }}>
            <CardTitulo>Resumo do Evento</CardTitulo>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {resumo.map(({ rotulo, valor }) => (
                <div key={rotulo} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#9CA3AF" }}>{rotulo}</span>
                  <span style={{ color: "#374151", fontWeight: 500, textAlign: "right" }}>{valor}</span>
                </div>
              ))}
            </div>
          </Card>

          {total > 0 && (
            <Card style={{ padding: "1.25rem", background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.2)" }}>
              <Rotulo>Total da Proposta</Rotulo>
              <div style={{ ...estiloValor, fontSize: "1.5rem" }}>{moeda(total)}</div>
            </Card>
          )}

          <Btn onClick={() => setConfirmando(true)} disabled={!podeEnviar} style={{ width: "100%" }}>
            Confirmar / Submeter Proposta
          </Btn>
          {!podeEnviar && <p style={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center" }}>Preencha todos os campos de preço para enviar</p>}
        </div>
      </div>

      {confirmando && (
        <Modal onClose={() => setConfirmando(false)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📤</div>
            <h3 style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Confirmar Envio</h3>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "16px" }}>Sua proposta será enviada ao organizador do evento para análise.</p>
            <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "12px", marginBottom: "1.5rem", textAlign: "left", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "#6B7280" }}>Valor total da proposta</span>
                <span style={estiloValor}>{moeda(total)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Btn variante="ghost" style={{ flex: 1 }} onClick={() => setConfirmando(false)}>
                Revisar
              </Btn>
              <Btn style={{ flex: 1 }} onClick={enviar}>
                ✓ Enviar Proposta
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
