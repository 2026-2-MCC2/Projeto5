import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NaoEncontrado from "../NaoEncontrado";
import { Calendar, Check, CircleAlert, MapPin, Send, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardTitulo,
  CabecalhoCard,
  Btn,
  Icone,
  Input,
  TextArea,
  ListaInfo,
  ModalConfirmacao,
  Picote,
  TextoComIcone,
  TituloPagina,
  Tabela,
  Linha,
  Celula,
  Valor,
} from "../../components/ui";
import "../../components/organizador.css";
import { buscarEvento, enviarProposta } from "../../services/fornecedorService";
import { dataCurta, faixaMoeda, moeda } from "../../utils/formatar";

const colunas = ["Descrição", "Qtd. Solicitada", "Unidade", "Preço Ofertado (unit.)", "Subtotal"];

export default function EnviarProposta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEvento(Number(id));
  const [precos, setPrecos] = useState(() => (evento ? evento.itens.map(() => 0) : []));
  const [observacoes, setObservacoes] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  if (!evento) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/fornecedor" rotuloVoltar="Ver oportunidades" />;

  const total = evento.itens.reduce((soma, item, i) => soma + precos[i] * item.quantidade, 0);
  const podeEnviar = precos.every((p) => p > 0);
  const preenchidos = precos.filter((p) => p > 0).length;
  const faltam = evento.itens.length - preenchidos;

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
    { rotulo: "Orçamento", valor: faixaMoeda(evento.orcamento) },
    { rotulo: "Prazo para envio", valor: dataCurta(evento.prazo) },
  ];

  return (
    <>
      <TituloPagina
        titulo={evento.nome}
        extra={<Badge>{evento.necessidades[0]}</Badge>}
        sub={
          <span style={{ display: "inline-flex", gap: "var(--esp-4)", flexWrap: "wrap" }}>
            <TextoComIcone icone={Calendar}>{dataCurta(evento.data)}</TextoComIcone>
            <TextoComIcone icone={MapPin}>{evento.local}</TextoComIcone>
            <TextoComIcone icone={Users}>{evento.convidados.toLocaleString("pt-BR")} convidados</TextoComIcone>
          </span>
        }
      />

      <div className="tt-detalhes">
        <div className="tt-detalhes__principal">
          <Card style={{ overflow: "hidden" }}>
            <CabecalhoCard titulo="Formulário de proposta" sub="Preencha o preço unitário de cada item solicitado">
              <span className="tt-progresso-itens">
                <span>
                  <strong>
                    {preenchidos} de {evento.itens.length}
                  </strong>{" "}
                  itens com preço
                </span>
                <span className="tt-progresso-itens__barra" aria-hidden="true">
                  <span style={{ width: `${(preenchidos / evento.itens.length) * 100}%` }} />
                </span>
              </span>
            </CabecalhoCard>

            <Tabela colunas={colunas}>
              {evento.itens.map((item, i) => (
                <Linha key={item.descricao} ultima={i === evento.itens.length - 1}>
                  <Celula style={{ color: "var(--texto)", fontWeight: 500 }}>{item.descricao}</Celula>
                  <Celula>
                    <Valor cor="var(--texto-2)" peso={400}>
                      {item.quantidade}
                    </Valor>
                  </Celula>
                  <Celula style={{ color: "var(--texto-suave)" }}>{item.unidade}</Celula>
                  <Celula>
                    <div style={{ position: "relative", width: "140px" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "var(--tam-sm)", color: "var(--texto-suave)", pointerEvents: "none" }}>R$</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0,00"
                        aria-label={`Preço unitário de ${item.descricao}`}
                        value={precos[i] || ""}
                        onChange={(e) => alterarPreco(i, e.target.value)}
                        destacado={precos[i] > 0}
                        style={{ paddingLeft: "36px", minHeight: "36px" }}
                      />
                    </div>
                  </Celula>
                  <Celula>
                    <Valor cor={precos[i] > 0 ? "var(--verde-texto)" : "var(--texto-suave)"}>{precos[i] > 0 ? moeda(precos[i] * item.quantidade) : "—"}</Valor>
                  </Celula>
                </Linha>
              ))}
            </Tabela>
          </Card>

          <Card style={{ padding: "var(--esp-5) var(--esp-6)" }}>
            <CardTitulo>Observações (opcional)</CardTitulo>
            <TextArea
              placeholder="Adicione informações adicionais, condições especiais, validade da proposta, etc."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Card>
        </div>

        <div className="tt-detalhes__lateral tt-lateral-fixa">
          <section className="tt-ticket-estimado" aria-label="Sua proposta">
            <div className="tt-ticket-estimado__topo">
              <span className="tt-ticket-estimado__icone">
                <Icone icone={Send} tamanho={18} />
              </span>
              <div>
                <h3>Sua proposta</h3>
                <p>Para {evento.organizador}</p>
              </div>
            </div>
            <Picote />
            <div style={{ padding: "var(--esp-5) var(--esp-6)" }}>
              <span className="tt-ticket-estimado__rotulo">Valor total</span>
              <strong className="tt-ticket-estimado__preco" style={{ display: "block", marginTop: 4, color: total > 0 ? "var(--texto)" : "var(--texto-suave)" }}>
                {total > 0 ? moeda(total) : "R$ 0"}
              </strong>
              <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", margin: "var(--esp-2) 0 var(--esp-5)" }}>Orçamento do organizador: {faixaMoeda(evento.orcamento)}</p>

              <Btn tamanho="lg" icone={Send} onClick={() => setConfirmando(true)} disabled={!podeEnviar} style={{ width: "100%" }}>
                Enviar proposta
              </Btn>
              {!podeEnviar && (
                <p className="tt-pendencia" style={{ marginTop: "var(--esp-3)" }}>
                  <Icone icone={CircleAlert} tamanho={16} />
                  {faltam === 1 ? "Falta o preço de 1 item" : `Falta o preço de ${faltam} itens`}
                </p>
              )}
            </div>
          </section>

          <Card style={{ padding: "var(--esp-5)" }}>
            <CardTitulo>Resumo do evento</CardTitulo>
            <ListaInfo itens={resumo} />
          </Card>
        </div>
      </div>

      {confirmando && (
        <ModalConfirmacao
          icone={Send}
          titulo="Confirmar envio"
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
