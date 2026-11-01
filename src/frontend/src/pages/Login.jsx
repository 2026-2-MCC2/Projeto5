import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LayoutDashboard, Lock, Mail, ShieldCheck, Ticket } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { AvisoAcesso, BotaoGoogle, BotaoMostrarSenha, CabecalhoAcesso, CampoAcesso, ConteudoBotao, DivisorOu, TelaAcesso } from "../components/Acesso";

const features = [
  { icon: LayoutDashboard, title: "Gerencie seus eventos", desc: "Organize informações, lotes e vendas em um único lugar." },
  { icon: Ticket, title: "Ingressos digitais", desc: "Acesse e acompanhe seus ingressos com segurança." },
  { icon: ShieldCheck, title: "Segurança em cada etapa", desc: "Sua conta e seus dados protegidos durante toda a experiência." },
];

// Mesmo formato de e-mail que a API aceita (src/backend/src/services/authService.js).
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  // Só visual: quais campos já foram visitados e se a pessoa já tentou enviar.
  // Os avisos de cada campo aparecem a partir daí, para não acusar erro antes de digitar.
  const [tocados, setTocados] = useState({});
  const [tentou, setTentou] = useState(false);
  const mostrar = (campo) => tentou || tocados[campo];
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }));

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      const usuario = await login(email, pass);
      navigate(`/${usuario.perfil}`); // organizador, fornecedor ou admin
    } catch (err) {
      setErro(err.message);
      setEntrando(false);
    }
  }

  // O navegador continua bloqueando o envio com campo inválido (required / type="email");
  // aqui só trocamos o balão padrão dele pelas mensagens embaixo dos campos.
  function aoInvalido(e) {
    e.preventDefault();
    setTentou(true);
    e.currentTarget.querySelector(":invalid")?.focus();
  }

  const erroEmail = !mostrar("email") ? "" : !email.trim() ? "Informe seu e-mail." : !EMAIL_VALIDO.test(email.trim()) ? "Digite um e-mail válido, como nome@empresa.com." : "";
  const erroSenha = mostrar("senha") && !pass ? "Informe sua senha." : "";

  return (
    <TelaAcesso
      linkTopo={{ pergunta: "Ainda não possui uma conta?", rotulo: "Criar conta", para: "/criar-conta" }}
      painel={
        <RightPanel
          heading="Tudo o que você precisa para viver e gerenciar eventos."
          sub="Uma experiência simples e segura para organizadores e participantes, do primeiro acesso até a entrada no evento."
          features={features}
          highlight={{
            title: "Uma experiência centralizada",
            desc: "Descubra eventos, acompanhe pedidos e gerencie tudo diretamente pelo TrocaTicket.",
          }}
        />
      }
    >
      <CabecalhoAcesso titulo="Acesse sua conta">
        Entre para acessar seu painel, acompanhar seus ingressos, eventos e todas as funcionalidades do TrocaTicket.
      </CabecalhoAcesso>

      <form
        onSubmit={(e) => {
          setTentou(true);
          handleLogin(e);
        }}
        onInvalidCapture={aoInvalido}
        className="tt-acesso__form"
      >
        {erro && (
          <AvisoAcesso key={erro} titulo="Não foi possível entrar">
            {erro}
          </AvisoAcesso>
        )}

        <fieldset className="tt-acesso__travado" disabled={entrando}>
          <CampoAcesso
            rotulo="E-mail"
            icone={Mail}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={tocar("email")}
            required
            estado={erroEmail ? "erro" : undefined}
            mensagem={erroEmail}
          />

          <CampoAcesso
            rotulo="Senha"
            icone={Lock}
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onBlur={tocar("senha")}
            required
            estado={erroSenha ? "erro" : undefined}
            mensagem={erroSenha}
            extra={
              <button type="button" className="tt-acesso__link" style={{ fontSize: "var(--tam-xs)" }}>
                Esqueceu sua senha?
              </button>
            }
            acao={<BotaoMostrarSenha visivel={showPass} onClick={() => setShowPass(!showPass)} />}
          />

          <button type="submit" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" aria-busy={entrando || undefined} style={{ marginTop: "var(--esp-2)" }}>
            <ConteudoBotao carregando={entrando} rotulo="Entrar" rotuloCarregando="Entrando..." />
          </button>
        </fieldset>
      </form>

      <DivisorOu />

      <BotaoGoogle>Entrar com Google</BotaoGoogle>
    </TelaAcesso>
  );
}
