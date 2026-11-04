import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KeyRound, Lock, Mail } from "lucide-react";
import { AvisoAcesso, BotaoMostrarSenha, CabecalhoAcesso, CampoAcesso, ConteudoBotao, SucessoAcesso, TelaAcesso } from "../components/Acesso";
import PainelSenha from "../components/PainelSenha";
import { redefinirSenha } from "../services/authService";

const SENHA_MIN = 6; // mesma regra da API

// Segunda etapa da redefinição: usa o código gerado pelo administrador para criar a senha nova.
export default function RedefinirSenha() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (senha.length < SENHA_MIN) return setErro(`A senha precisa ter no mínimo ${SENHA_MIN} caracteres.`);
    if (senha !== confirmacao) return setErro("As senhas não coincidem.");

    setEnviando(true);
    try {
      const { mensagem } = await redefinirSenha({ email, codigo, senha });
      setSucesso(mensagem);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const estadoConfirmacao = !confirmacao ? {} : confirmacao === senha ? { estado: "ok", mensagem: "As senhas coincidem." } : { estado: "erro", mensagem: "As senhas não coincidem." };

  return (
    <TelaAcesso linkTopo={{ pergunta: "Ainda não tem o código?", rotulo: "Pedir código", para: "/esqueci-senha" }} painel={<PainelSenha />}>
      {sucesso ? (
        <SucessoAcesso titulo="Senha alterada" rodape="Levando você para o login...">
          {sucesso}
        </SucessoAcesso>
      ) : (
        <>
          <CabecalhoAcesso titulo="Criar nova senha">Informe o código passado pelo administrador e escolha a senha nova.</CabecalhoAcesso>

          <form onSubmit={enviar} className="tt-acesso__form">
            {erro && (
              <AvisoAcesso key={erro} titulo="Não foi possível alterar a senha">
                {erro}
              </AvisoAcesso>
            )}

            <fieldset className="tt-acesso__travado" disabled={enviando}>
              <CampoAcesso rotulo="E-mail" icone={Mail} type="email" autoComplete="email" placeholder="seu@email.com" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} required />

              <CampoAcesso rotulo="Código" icone={KeyRound} type="text" autoComplete="one-time-code" placeholder="Código de 8 caracteres" maxLength={8} value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} required />

              <CampoAcesso
                rotulo="Senha nova"
                icone={Lock}
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                placeholder={`Mínimo ${SENHA_MIN} caracteres`}
                maxLength={72}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                acao={<BotaoMostrarSenha visivel={mostrarSenha} onClick={() => setMostrarSenha(!mostrarSenha)} />}
              />

              <CampoAcesso
                rotulo="Confirmar senha nova"
                icone={Lock}
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha nova"
                maxLength={72}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                required
                {...estadoConfirmacao}
              />

              <button type="submit" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" aria-busy={enviando || undefined} style={{ marginTop: "var(--esp-2)" }}>
                <ConteudoBotao carregando={enviando} rotulo="Alterar senha" rotuloCarregando="Alterando..." />
              </button>
            </fieldset>
          </form>
        </>
      )}
    </TelaAcesso>
  );
}
