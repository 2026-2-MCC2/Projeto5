import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Briefcase, Building2, CalendarDays, CircleCheck, Clock, Mail } from "lucide-react";
import { Aviso, Card, Badge, Btn, CabecalhoModal, Chip, Contador, Esqueleto, ErroCarregar, ListaDetalhes, Modal, ModalConfirmacao, TextArea, TextoComIcone, TituloPagina, Vazio } from "../../components/ui";
import RedefinicoesSenha from "../../components/RedefinicoesSenha";
import "../../components/organizador.css";
import "./Aprovacoes.css";
import { aprovarUsuario, rejeitarUsuario } from "../../services/authService";
import { ROTULO_PERFIL } from "../../data/perfis";
import { tempoDesde } from "../../utils/formatar";
import { mascararCnpj } from "../../utils/cnpj";

const abas = [
  { rotulo: "Todos", perfil: null },
  { rotulo: "Fornecedores", perfil: "fornecedor" },
  { rotulo: "Organizadores", perfil: "organizador" },
];

const variantePerfil = { fornecedor: "info", organizador: "success" };
const iconePerfil = { fornecedor: Briefcase, organizador: CalendarDays };

const aguardando = (u) => (u.criadoEm ? tempoDesde(u.criadoEm) : "—");
const cnpjDe = (u) => (u.cnpj ? mascararCnpj(u.cnpj) : "Não informado");

// "Ana Paula Souza" -> "AS"
function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

function detalhes(u) {
  return [
    { rotulo: "Nome", valor: u.nome },
    { rotulo: "E-mail", valor: u.email },
    { rotulo: "CNPJ", valor: cnpjDe(u) },
    { rotulo: "Perfil", valor: ROTULO_PERFIL[u.perfil] },
    { rotulo: "Aguardando", valor: aguardando(u) },
  ];
}

function EsqueletoCadastro() {
  return (
    <Card style={{ padding: "var(--esp-5)" }}>
      <div className="tt-cadastro" aria-hidden="true">
        <Esqueleto largura="44px" altura="44px" raio="50%" />
        <div style={{ flex: 1, display: "grid", gap: 8 }}>
          <Esqueleto largura="40%" altura="16px" />
          <Esqueleto largura="60%" />
        </div>
        <Esqueleto largura="220px" altura="32px" raio="8px" />
      </div>
    </Card>
  );
}

export default function Aprovacoes() {
  const { pendentes, carregandoPendentes, erroPendentes, recarregarPendentes } = useOutletContext();
  const [aba, setAba] = useState(abas[0]);
  const [vendo, setVendo] = useState(null);
  const [aprovando, setAprovando] = useState(null);
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const doPerfil = (perfil) => pendentes.filter((u) => !perfil || u.perfil === perfil);
  const visiveis = doPerfil(aba.perfil);

  // Chama a API e, se der certo, fecha o modal, mostra a mensagem e atualiza a lista.
  async function enviar(acao, mensagem, fechar) {
    setErro("");
    setSucesso("");
    setEnviando(true);
    try {
      await acao();
      fechar();
      setSucesso(mensagem);
      await recarregarPendentes();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const aprovar = () => enviar(() => aprovarUsuario(aprovando.id), `${aprovando.nome} foi aprovado e já pode entrar.`, () => setAprovando(null));
  const rejeitar = () => enviar(() => rejeitarUsuario(rejeitando.id, motivo.trim()), `O cadastro de ${rejeitando.nome} foi rejeitado.`, fecharRejeicao);

  function fecharRejeicao() {
    setRejeitando(null);
    setMotivo("");
    setErro("");
  }

  function fecharAprovacao() {
    if (enviando) return;
    setAprovando(null);
    setErro("");
  }

  return (
    <>
      <TituloPagina titulo="Aprovações Pendentes" extra={!carregandoPendentes && !erroPendentes && <Contador valor={pendentes.length} grande />} sub="Revise os novos cadastros antes de liberar o acesso" />

      {!erroPendentes && (
        <div className="tt-filtros">
          <div className="tt-filtros__abas" role="group" aria-label="Filtrar por perfil">
            {abas.map((a) => (
              <Chip key={a.rotulo} rotulo={`${a.rotulo} (${carregandoPendentes ? "…" : doPerfil(a.perfil).length})`} ativo={aba === a} onClick={() => setAba(a)} redondo={false} />
            ))}
          </div>
        </div>
      )}

      {sucesso && (
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "var(--esp-5)" }}>
          {sucesso}
        </Aviso>
      )}

      {carregandoPendentes ? (
        <div style={{ display: "grid", gap: "var(--esp-3)" }} role="status" aria-label="Carregando cadastros pendentes">
          {[0, 1, 2].map((i) => (
            <EsqueletoCadastro key={i} />
          ))}
        </div>
      ) : erroPendentes ? (
        <ErroCarregar titulo="Não foi possível carregar os cadastros" mensagem={erroPendentes} onTentar={recarregarPendentes} />
      ) : visiveis.length === 0 ? (
        <Card>
          <Vazio icone={CircleCheck} titulo="Nenhuma aprovação pendente" texto="Todas as solicitações desta categoria foram processadas." />
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "var(--esp-3)" }}>
          {visiveis.map((u) => (
            <Card key={u.id} style={{ padding: "var(--esp-5)" }}>
              <div className="tt-cadastro">
                <span className={`tt-cadastro__avatar tt-badge--${variantePerfil[u.perfil]}`} aria-hidden="true">
                  {iniciais(u.nome)}
                </span>
                <div className="tt-cadastro__dados">
                  <div className="tt-cadastro__nome">
                    <h3>{u.nome}</h3>
                    <Badge variante={variantePerfil[u.perfil]}>
                      <TextoComIcone icone={iconePerfil[u.perfil]} tamanho={12} style={{ gap: 4 }}>
                        {ROTULO_PERFIL[u.perfil]}
                      </TextoComIcone>
                    </Badge>
                  </div>
                  <div className="tt-cadastro__meta">
                    <TextoComIcone icone={Mail} tamanho={14}>
                      {u.email}
                    </TextoComIcone>
                    <TextoComIcone icone={Building2} tamanho={14}>
                      {cnpjDe(u)}
                    </TextoComIcone>
                    <TextoComIcone icone={Clock} tamanho={14}>
                      Aguardando {aguardando(u)}
                    </TextoComIcone>
                  </div>
                </div>
                <div className="tt-cadastro__acoes">
                  <Btn variante="ghost" tamanho="sm" onClick={() => setVendo(u)}>
                    Ver detalhes
                  </Btn>
                  <Btn variante="danger" tamanho="sm" onClick={() => setRejeitando(u)}>
                    Rejeitar
                  </Btn>
                  <Btn tamanho="sm" icone={CircleCheck} onClick={() => setAprovando(u)}>
                    Aprovar
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RedefinicoesSenha />

      {vendo && (
        <Modal onClose={() => setVendo(null)}>
          <CabecalhoModal onFechar={() => setVendo(null)}>
            <Badge variante={variantePerfil[vendo.perfil]}>{ROTULO_PERFIL[vendo.perfil]}</Badge>
            <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginTop: "var(--esp-2)" }}>{vendo.nome}</h3>
          </CabecalhoModal>
          <ListaDetalhes itens={detalhes(vendo)} />
          <div style={{ display: "flex", gap: "var(--esp-3)" }}>
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
        <Modal onClose={enviando ? undefined : fecharRejeicao}>
          <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-2)" }}>Rejeitar: {rejeitando.nome}</h3>
          <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>Informe o motivo da rejeição. O solicitante verá esse motivo ao tentar entrar.</p>
          <TextArea
            placeholder="Ex: Documentação incompleta, CNPJ inválido, categoria não suportada..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={500}
            style={{ marginBottom: "var(--esp-2)" }}
          />
          <p style={{ fontSize: "var(--tam-xs)", color: "var(--texto-suave)", textAlign: "right", marginBottom: "var(--esp-4)" }}>{motivo.length}/500</p>
          {erro && (
            <Aviso variante="erro" style={{ marginBottom: "var(--esp-4)" }}>
              {erro}
            </Aviso>
          )}
          <div style={{ display: "flex", gap: "var(--esp-3)" }}>
            <Btn variante="secondary" style={{ flex: 1 }} onClick={fecharRejeicao} disabled={enviando}>
              Cancelar
            </Btn>
            <Btn variante="danger" style={{ flex: 1 }} onClick={rejeitar} disabled={!motivo.trim()} carregando={enviando}>
              {enviando ? "Rejeitando..." : "Confirmar Rejeição"}
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
              <strong style={{ color: "var(--texto)" }}>{aprovando.nome}</strong> será aprovado e terá acesso completo à plataforma.
            </>
          }
          rotuloConfirmar={enviando ? "Aprovando..." : "Confirmar Aprovação"}
          carregando={enviando}
          erro={erro}
          onCancelar={fecharAprovacao}
          onConfirmar={aprovar}
        />
      )}
    </>
  );
}
