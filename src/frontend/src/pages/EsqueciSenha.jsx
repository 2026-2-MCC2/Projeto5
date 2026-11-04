import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { AvisoAcesso, CabecalhoAcesso, CampoAcesso, ConteudoBotao, TelaAcesso } from "../components/Acesso";
import PainelSenha from "../components/PainelSenha";
import { solicitarRedefinicao } from "../services/authService";

// Primeira etapa da redefinição: registra o pedido para o administrador.
export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const { mensagem } = await solicitarRedefinicao(email);
      setSucesso(mensagem);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const irParaCodigo = () => navigate("/redefinir-senha", { state: { email } });

  return (
    <TelaAcesso linkTopo={{ pergunta: "Lembrou a senha?", rotulo: "Entrar", para: "/login" }} painel={<PainelSenha />}>
      <CabecalhoAcesso titulo="Esqueceu sua senha?">Informe o e-mail da sua conta. O administrador vai receber o pedido e passar um código para você.</CabecalhoAcesso>

      {sucesso ? (
        <div className="tt-acesso__form">
          <AvisoAcesso variante="sucesso" titulo="Pedido registrado">
            {sucesso}
          </AvisoAcesso>
          <button type="button" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" onClick={irParaCodigo}>
            <ConteudoBotao rotulo="Já tenho o código" />
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} className="tt-acesso__form">
          {erro && (
            <AvisoAcesso key={erro} titulo="Não foi possível registrar o pedido">
              {erro}
            </AvisoAcesso>
          )}

          <fieldset className="tt-acesso__travado" disabled={enviando}>
            <CampoAcesso rotulo="E-mail" icone={Mail} type="email" autoComplete="email" placeholder="seu@email.com" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} required />

            <button type="submit" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" aria-busy={enviando || undefined} style={{ marginTop: "var(--esp-2)" }}>
              <ConteudoBotao carregando={enviando} rotulo="Pedir redefinição" rotuloCarregando="Enviando..." />
            </button>

            <button type="button" className="tt-acesso__link" onClick={irParaCodigo}>
              Já tenho um código
            </button>
          </fieldset>
        </form>
      )}
    </TelaAcesso>
  );
}
