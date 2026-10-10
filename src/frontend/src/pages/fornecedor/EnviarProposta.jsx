import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, Send } from "lucide-react";
import {
  Card,
  CardTitulo,
  CabecalhoCard,
  Rotulo,
  Btn,
  Input,
  TextArea,
  ListaInfo,
  ModalConfirmacao,
  TituloPagina,
  Tabela,
  Linha,
  Celula,
  RodapeCard,
  Valor,
} from "../../components/ui";
import { buscarEvento, enviarProposta } from "../../services/fornecedorService";
import { dataCurta, moeda } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd. Solicitada", "Unidade", "Preço Ofertado (unit.)", "Subtotal"];

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
            <CabecalhoCard titulo="Formulário de Proposta" sub="Preencha o preço ofertado para cada item solicitado" />

            <Tabela colunas={colunas}>
              {evento.itens.map((item, i) => (
                <Linha key={item.descricao} ultima={i === evento.itens.length - 1}>
                  <Celula style={{ fontSize: "0.875rem", color: "#111827" }}>{item.descricao}</Celula>
                  <Celula>
                    <Valor cor="#6B7280" peso={400}>
                      {item.quantidade}
                    </Valor>
                  </Celula>
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
                  <Celula>
                    <Valor cor={precos[i] > 0 ? "#059669" : "#9CA3AF"}>{precos[i] > 0 ? moeda(precos[i] * item.quantidade) : "—"}</Valor>
                  </Celula>
                </Linha>
              ))}
            </Tabela>

            <RodapeCard>
              <span style={{ fontFamily: "Outfit", fontWeight: 700, color: "#374151" }}>VALOR TOTAL DA PROPOSTA</span>
              <Valor tamanho="1.375rem" peso={700}>
                {total > 0 ? moeda(total) : "—"}
              </Valor>
            </RodapeCard>
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
            <ListaInfo itens={resumo} />
          </Card>

          {total > 0 && (
            <Card variante="sucesso" style={{ padding: "1.25rem" }}>
              <Rotulo>Total da Proposta</Rotulo>
              <Valor tamanho="1.5rem" peso={700}>
                {moeda(total)}
              </Valor>
            </Card>
          )}

          <Btn onClick={() => setConfirmando(true)} disabled={!podeEnviar} style={{ width: "100%" }}>
            Confirmar / Submeter Proposta
          </Btn>
          {!podeEnviar && <p style={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center" }}>Preencha todos os campos de preço para enviar</p>}
        </div>
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone={Send}
          titulo="Confirmar Envio"
          descricao="Sua proposta será enviada ao organizador do evento para análise."
          rotuloValor="Valor total da proposta"
          valor={moeda(total)}
          rotuloCancelar="Revisar"
          rotuloConfirmar="Enviar Proposta"
          iconeConfirmar={Check}
          onCancelar={() => setConfirmando(false)}
          onConfirmar={enviar}
        />
      )}
    </>
  );
}
