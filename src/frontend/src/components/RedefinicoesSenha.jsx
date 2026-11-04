import { useEffect, useState } from "react";
import { CircleCheck, Clock, Copy, KeyRound, Mail } from "lucide-react";
import { Aviso, Badge, Btn, Card, Contador, ErroCarregar, Esqueleto, Modal, TextoComIcone, Vazio } from "./ui";
import { gerarCodigoRedefinicao, listarRedefinicoes } from "../services/adminService";
import { ROTULO_PERFIL } from "../data/perfis";
import { tempoDesde } from "../utils/formatar";

// Pedidos de redefinição de senha, na tela de Aprovações do admin.
// Tem estado próprio: uma falha aqui não atrapalha a aprovação de cadastros.
export default function RedefinicoesSenha() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [gerando, setGerando] = useState(null); // id do pedido
  const [erroGerar, setErroGerar] = useState("");
  const [gerado, setGerado] = useState(null); // { pedido, codigo, validade_minutos }
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarRedefinicoes()
      .then((lista) => ativo && setPedidos(lista))
      .catch((err) => ativo && setErro(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const recarregar = () => {
    setErro("");
    setCarregando(true);
    setTentativa((n) => n + 1);
  };

  async function gerar(pedido) {
    setErroGerar("");
    setGerando(pedido.id);
    try {
      const resposta = await gerarCodigoRedefinicao(pedido.id);
      setCopiado(false);
      setGerado({ pedido, ...resposta });
    } catch (err) {
      setErroGerar(err.message);
    } finally {
      setGerando(null);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(gerado.codigo);
      setCopiado(true);
    } catch {
      setCopiado(false); // sem acesso à área de transferência: o código continua visível para anotar
    }
  }

  function fecharCodigo() {
    setGerado(null);
    recarregar();
  }

  return (
    <section style={{ marginTop: "var(--esp-8)" }} aria-labelledby="titulo-redefinicoes">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--esp-2)", marginBottom: "var(--esp-1)" }}>
        <h2 id="titulo-redefinicoes" style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)" }}>
          Redefinições de senha
        </h2>
        {!carregando && !erro && <Contador valor={pedidos.length} />}
      </div>
      <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>
        Confirme quem está pedindo antes de passar o código. Ele permite trocar a senha da conta.
      </p>

      {erroGerar && (
        <Aviso variante="erro" onFechar={() => setErroGerar("")} style={{ marginBottom: "var(--esp-4)" }}>
          {erroGerar}
        </Aviso>
      )}

      {carregando ? (
        <Card style={{ padding: "var(--esp-5)" }}>
          <div role="status" aria-label="Carregando pedidos de redefinição">
            <Esqueleto largura="40%" altura="16px" style={{ marginBottom: 8 }} />
            <Esqueleto largura="60%" />
          </div>
        </Card>
      ) : erro ? (
        <ErroCarregar titulo="Não foi possível carregar os pedidos" mensagem={erro} onTentar={recarregar} />
      ) : pedidos.length === 0 ? (
        <Card>
          <Vazio icone={CircleCheck} titulo="Nenhum pedido em aberto" texto="Os pedidos de redefinição de senha aparecem aqui." />
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "var(--esp-3)" }}>
          {pedidos.map((p) => (
            <Card key={p.id} style={{ padding: "var(--esp-5)" }}>
              <div className="tt-cadastro">
                <div className="tt-cadastro__dados">
                  <div className="tt-cadastro__nome">
                    <h3>{p.nome}</h3>
                    <Badge>{ROTULO_PERFIL[p.perfil]}</Badge>
                    {p.codigo_ativo && <Badge variante="warning">Código ativo</Badge>}
                  </div>
                  <div className="tt-cadastro__meta">
                    <TextoComIcone icone={Mail} tamanho={14}>
                      {p.email}
                    </TextoComIcone>
                    <TextoComIcone icone={Clock} tamanho={14}>
                      Pedido {p.solicitadoEm ? tempoDesde(p.solicitadoEm) : "—"}
                    </TextoComIcone>
                  </div>
                </div>
                <div className="tt-cadastro__acoes">
                  <Btn tamanho="sm" icone={KeyRound} carregando={gerando === p.id} disabled={gerando !== null} onClick={() => gerar(p)}>
                    {gerando === p.id ? "Gerando..." : p.codigo_ativo ? "Gerar novo código" : "Gerar código"}
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sem fechar ao clicar fora: o código só aparece aqui, uma única vez. */}
      {gerado && (
        <Modal>
          <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-2)" }}>Código de {gerado.pedido.nome}</h3>
          <p style={{ fontSize: "var(--tam-base)", color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>
            Passe este código para a pessoa. Ele vale por {gerado.validade_minutos} minutos, serve uma única vez e <strong>não aparece de novo</strong>.
          </p>
          <p
            aria-label={`Código: ${gerado.codigo}`}
            style={{ padding: "var(--esp-4)", marginBottom: "var(--esp-4)", borderRadius: "var(--raio-md)", background: "var(--superficie-2)", textAlign: "center", fontSize: "var(--tam-2xl)", fontWeight: 700, letterSpacing: "0.15em", color: "var(--texto)", fontVariantNumeric: "tabular-nums" }}
          >
            {gerado.codigo}
          </p>
          <div style={{ display: "flex", gap: "var(--esp-3)" }}>
            <Btn variante="secondary" icone={copiado ? CircleCheck : Copy} style={{ flex: 1 }} onClick={copiar}>
              {copiado ? "Copiado" : "Copiar código"}
            </Btn>
            <Btn style={{ flex: 1 }} onClick={fecharCodigo}>
              Já anotei
            </Btn>
          </div>
        </Modal>
      )}
    </section>
  );
}
