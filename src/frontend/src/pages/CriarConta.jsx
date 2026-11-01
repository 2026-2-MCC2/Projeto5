import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";
import { ArrowRight, CalendarPlus, LoaderCircle, Lock, Mail, ShieldCheck, Ticket, User } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { BotaoGoogle, BotaoMostrarSenha, CabecalhoAcesso, CampoAcesso, DivisorOu, TelaAcesso } from "../components/Acesso";
import { Aviso, Icone } from "../components/ui";
import { ROTULO_PERFIL } from "../data/perfis";
// login adm: admin@trocaticket.com - admin123
const features = [
  { icon: CalendarPlus, title: "Crie e organize eventos", desc: "Centralize informações, lotes, participantes e vendas." },
  { icon: Ticket, title: "Venda e gerencie ingressos", desc: "Controle seus ingressos e acompanhe os pedidos em um único ambiente." },
  { icon: ShieldCheck, title: "Conta segura", desc: "Autenticação e proteção de dados integradas à plataforma." },
];

export default function CriarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [perfil, setPerfil] = useState("organizador");
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setErro("");

    if (pass.length < 6) return setErro("A senha precisa ter no mínimo 6 caracteres.");
    if (pass !== conf) return setErro("As senhas não coincidem.");
    if (!aceito) return setErro("Aceite os Termos de Uso e a Política de Privacidade para continuar.");

    setEnviando(true);
    try {
      await registrar({ nome, email, senha: pass, perfil });
      setSucesso("Conta criada! Aguarde a aprovação do administrador para entrar.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaAcesso
      linkTopo={{ pergunta: "Já possui uma conta?", rotulo: "Entrar", para: "/login" }}
      painel={
        <RightPanel
          heading="Sua experiência com eventos começa aqui."
          sub="Crie sua conta e tenha acesso a uma plataforma completa para eventos, ingressos, pedidos e experiências."
          features={features}
          highlight={{
            title: "Cadastro simples e rápido",
            desc: "Após criar sua conta, aguarde a aprovação do administrador para começar a usar a TrocaTicket.",
          }}
        />
      }
    >
      <CabecalhoAcesso titulo="Crie sua conta">
        Comece gratuitamente e tenha acesso ao ecossistema TrocaTicket para descobrir, organizar e gerenciar eventos.
      </CabecalhoAcesso>

      <form onSubmit={handleRegister} className="tt-acesso__form">
        <div>
          <span className="tt-acesso__grupo-rotulo" id="rotulo-perfil">
            Tipo de conta
          </span>
          <div className="tt-acesso__perfis" role="radiogroup" aria-labelledby="rotulo-perfil">
            {["organizador", "fornecedor", "admin"].map((r) => (
              <button type="button" key={r} role="radio" aria-checked={perfil === r} onClick={() => setPerfil(r)}>
                {ROTULO_PERFIL[r]}
              </button>
            ))}
          </div>
        </div>

        <CampoAcesso
          rotulo="Nome completo"
          icone={User}
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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

        <div className="tt-acesso__dupla">
          <CampoAcesso
            rotulo="Senha"
            icone={Lock}
            type={showPass ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            acao={<BotaoMostrarSenha visivel={showPass} onClick={() => setShowPass(!showPass)} />}
          />
          <CampoAcesso
            rotulo="Confirmar senha"
            icone={Lock}
            type={showConf ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita sua senha"
            value={conf}
            onChange={(e) => setConf(e.target.value)}
            required
            acao={<BotaoMostrarSenha visivel={showConf} onClick={() => setShowConf(!showConf)} />}
          />
        </div>

        <label className="tt-acesso__termos">
          <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
          <span>
            Ao criar sua conta, você concorda com nossos{" "}
            <button type="button" className="tt-acesso__link">
              Termos de Uso
            </button>{" "}
            e com a{" "}
            <button type="button" className="tt-acesso__link">
              Política de Privacidade
            </button>
            .
          </span>
        </label>

        {erro && <Aviso variante="erro">{erro}</Aviso>}
        {sucesso && <Aviso variante="sucesso">{sucesso}</Aviso>}

        <button
          type="submit"
          className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo"
          disabled={!!sucesso || enviando}
          aria-busy={enviando || undefined}
          style={{ marginTop: "var(--esp-2)" }}
        >
          {enviando ? "Criando conta..." : "Criar conta"}
          <Icone icone={enviando ? LoaderCircle : ArrowRight} className={enviando ? "tt-girando" : undefined} />
        </button>
      </form>

      <DivisorOu />

      <BotaoGoogle>Criar conta com Google</BotaoGoogle>
    </TelaAcesso>
  );
}
