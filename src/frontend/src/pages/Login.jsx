import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, LayoutDashboard, LoaderCircle, Lock, Mail, ShieldCheck, Ticket } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { BotaoGoogle, BotaoMostrarSenha, CabecalhoAcesso, CampoAcesso, DivisorOu, TelaAcesso } from "../components/Acesso";
import { Aviso, Icone } from "../components/ui";

const features = [
  { icon: LayoutDashboard, title: "Gerencie seus eventos", desc: "Organize informações, lotes e vendas em um único lugar." },
  { icon: Ticket, title: "Ingressos digitais", desc: "Acesse e acompanhe seus ingressos com segurança." },
  { icon: ShieldCheck, title: "Segurança em cada etapa", desc: "Sua conta e seus dados protegidos durante toda a experiência." },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

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

      <form onSubmit={handleLogin} className="tt-acesso__form">
        <CampoAcesso
          rotulo="E-mail"
          icone={Mail}
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <CampoAcesso
          rotulo="Senha"
          icone={Lock}
          type={showPass ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          extra={
            <button type="button" className="tt-acesso__link" style={{ fontSize: "var(--tam-xs)" }}>
              Esqueceu sua senha?
            </button>
          }
          acao={<BotaoMostrarSenha visivel={showPass} onClick={() => setShowPass(!showPass)} />}
        />

        {erro && <Aviso variante="erro">{erro}</Aviso>}

        <button type="submit" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" disabled={entrando} aria-busy={entrando || undefined} style={{ marginTop: "var(--esp-2)" }}>
          {entrando ? "Entrando..." : "Entrar"}
          <Icone icone={entrando ? LoaderCircle : ArrowRight} className={entrando ? "tt-girando" : undefined} />
        </button>
      </form>

      <DivisorOu />

      <BotaoGoogle>Entrar com Google</BotaoGoogle>
    </TelaAcesso>
  );
}
