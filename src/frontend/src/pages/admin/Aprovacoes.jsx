import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { Card, Badge, Btn, CabecalhoModal, Chip, Contador, ListaDetalhes, Modal, ModalConfirmacao, TextArea, TituloPagina, Vazio } from "../../components/ui";
import { aprovarUsuario, rejeitarUsuario } from "../../services/authService";
import { ROTULO_PERFIL } from "../../data/perfis";
import { tempoDesde } from "../../utils/formatar";

const abas = [
  { rotulo: "Todos", perfil: null },
  { rotulo: "Fornecedores", perfil: "fornecedor" },
  { rotulo: "Organizadores", perfil: "organizador" },
];

const variantePerfil = { fornecedor: "info", organizador: "success" };

const aguardando = (u) => (u.criadoEm ? tempoDesde(u.criadoEm) : "—");

function detalhes(u) {
  return [
    { rotulo: "Nome", valor: u.nome },
    { rotulo: "E-mail", valor: u.email },
    { rotulo: "Perfil", valor: ROTULO_PERFIL[u.perfil] },
    { rotulo: "Aguardando", valor: aguardando(u) },
  ];
}

export default function Aprovacoes() {
  const { pendentes, recarregarPendentes } = useOutletContext();
  const [aba, setAba] = useState(abas[0]);
  const [vendo, setVendo] = useState(null);
  const [aprovando, setAprovando] = useState(null);
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState("");

  const doPerfil = (perfil) => pendentes.filter((u) => !perfil || u.perfil === perfil);
  const visiveis = doPerfil(aba.perfil);

  function aprovar() {
    aprovarUsuario(aprovando.id);
    setAprovando(null);
    recarregarPendentes();
  }

  function rejeitar() {
    rejeitarUsuario(rejeitando.id, motivo.trim());
    fecharRejeicao();
    recarregarPendentes();
  }

  function fecharRejeicao() {
    setRejeitando(null);
    setMotivo("");
  }

  return (
    <>
      <TituloPagina titulo="Aprovações Pendentes" extra={<Contador valor={pendentes.length} grande />} sub="Revisão e aprovação de novos cadastros" />

      <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {abas.map((a) => (
          <Chip key={a.rotulo} rotulo={`${a.rotulo} (${doPerfil(a.perfil).length})`} ativo={aba === a} onClick={() => setAba(a)} redondo={false} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {visiveis.map((u) => (
          <Card key={u.id} style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Badge variante={variantePerfil[u.perfil]}>{ROTULO_PERFIL[u.perfil]}</Badge>
                  <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{u.nome}</h3>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280", marginBottom: "4px" }}>{u.email}</p>
                <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Aguardando {aguardando(u)}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Btn variante="ghost" tamanho="sm" onClick={() => setVendo(u)}>
                  Ver detalhes
                </Btn>
                <Btn variante="danger" tamanho="sm" onClick={() => setRejeitando(u)}>
                  Rejeitar
                </Btn>
                <Btn tamanho="sm" onClick={() => setAprovando(u)}>
                  Aprovar
                </Btn>
              </div>
            </div>
          </Card>
        ))}

        {visiveis.length === 0 && <Vazio icone={CircleCheck} titulo="Nenhuma aprovação pendente" texto="Todas as solicitações desta categoria foram processadas" />}
      </div>

      {vendo && (
        <Modal onClose={() => setVendo(null)}>
          <CabecalhoModal onFechar={() => setVendo(null)}>
            <Badge variante={variantePerfil[vendo.perfil]}>{ROTULO_PERFIL[vendo.perfil]}</Badge>
            <h3 style={{ fontFamily: "Outfit", fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginTop: "8px" }}>{vendo.nome}</h3>
          </CabecalhoModal>
          <ListaDetalhes itens={detalhes(vendo)} />
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variante="danger" style={{ flex: 1 }} onClick={() => { setVendo(null); setRejeitando(vendo); }}>
              Rejeitar
            </Btn>
            <Btn style={{ flex: 1 }} onClick={() => { setVendo(null); setAprovando(vendo); }}>
              Aprovar
            </Btn>
          </div>
        </Modal>
      )}

      {rejeitando && (
        <Modal onClose={fecharRejeicao}>
          <h3 style={{ fontFamily: "Outfit", fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Rejeitar: {rejeitando.nome}</h3>
          <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "16px" }}>Informe o motivo da rejeição. O solicitante verá esse motivo ao tentar entrar.</p>
          <TextArea
            placeholder="Ex: Documentação incompleta, CNPJ inválido, categoria não suportada..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            style={{ marginBottom: "16px" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variante="ghost" style={{ flex: 1 }} onClick={fecharRejeicao}>
              Cancelar
            </Btn>
            <Btn variante="danger" style={{ flex: 1 }} onClick={rejeitar} disabled={!motivo.trim()}>
              Confirmar Rejeição
            </Btn>
          </div>
        </Modal>
      )}

      {aprovando && (
        <ModalConfirmacao
          icone={CircleCheck}
          variante="success"
          titulo="Aprovar cadastro?"
          descricao={
            <>
              <strong style={{ color: "#111827" }}>{aprovando.nome}</strong> será aprovado e terá acesso completo à plataforma.
            </>
          }
          rotuloConfirmar="Confirmar Aprovação"
          onCancelar={() => setAprovando(null)}
          onConfirmar={aprovar}
        />
      )}
    </>
  );
}
