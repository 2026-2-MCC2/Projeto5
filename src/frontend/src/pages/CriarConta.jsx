import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";
import { Briefcase, CalendarDays, CalendarPlus, CircleAlert, Lock, Mail, ShieldCheck, Ticket, User } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { Icone } from "../components/ui";
import {
  AvisoAcesso,
  BotaoGoogle,
  BotaoMostrarSenha,
  CabecalhoAcesso,
  CampoAcesso,
  ConteudoBotao,
  DivisorOu,
  EscolhaPerfil,
  SucessoAcesso,
  TelaAcesso,
} from "../components/Acesso";
// login adm: admin@trocaticket.com - admin123
const features = [
  { icon: CalendarPlus, title: "Crie e organize eventos", desc: "Centralize informações, lotes, participantes e vendas." },
  { icon: Ticket, title: "Venda e gerencie ingressos", desc: "Controle seus ingressos e acompanhe os pedidos em um único ambiente." },
  { icon: ShieldCheck, title: "Conta segura", desc: "Autenticação e proteção de dados integradas à plataforma." },
];

// Os dois perfis que podem se cadastrar (a API recusa "admin" no cadastro).
const perfis = [
  { valor: "organizador", icone: CalendarDays, titulo: "Organizador", texto: "Publico eventos e recebo propostas" },
  { valor: "fornecedor", icone: Briefcase, titulo: "Fornecedor", texto: "Envio propostas para eventos" },
];

// Mesmas regras da API (src/backend/src/services/authService.js), só para avisar antes de enviar.
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;
const faltam = (n) => (n === 1 ? "Falta 1 caractere" : `Faltam ${n} caracteres`);

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

  // Só visual: quais campos já foram visitados e se a pessoa já tentou enviar.
  const [tocados, setTocados] = useState({});
  const [tentou, setTentou] = useState(false);
  const mostrar = (campo) => tentou || tocados[campo];
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }));

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

  // O navegador continua bloqueando o envio com campo vazio ou e-mail inválido;
  // aqui só trocamos o balão padrão dele pelas mensagens embaixo dos campos.
  function aoInvalido(e) {
    e.preventDefault();
    setTentou(true);
    e.currentTarget.querySelector(":invalid")?.focus();
  }

  // ── Estado visual de cada campo ──
  const emailLimpo = email.trim();
  const nomeCampo = !mostrar("nome") ? {} : nome.trim() ? { estado: "ok" } : { estado: "erro", mensagem: "Informe seu nome." };

  const emailCampo = !mostrar("email")
    ? {}
    : !emailLimpo
      ? { estado: "erro", mensagem: "Informe seu e-mail." }
      : !EMAIL_VALIDO.test(emailLimpo)
        ? { estado: "erro", mensagem: "Digite um e-mail válido, como nome@empresa.com." }
        : { estado: "ok" };

  const senhaCampo =
    pass.length >= SENHA_MIN
      ? { estado: "ok", mensagem: "Tamanho de senha válido." }
      : mostrar("senha")
        ? { estado: "erro", mensagem: pass ? `${faltam(SENHA_MIN - pass.length)} para o mínimo de ${SENHA_MIN}.` : "Crie uma senha." }
        : { mensagem: `Use pelo menos ${SENHA_MIN} caracteres.` };

  const confCampo =
    conf && conf === pass
      ? { estado: "ok", mensagem: "As senhas coincidem." }
      : conf && mostrar("conf")
        ? { estado: "erro", mensagem: "As senhas não coincidem." }
        : tentou && !conf
          ? { estado: "erro", mensagem: "Repita a senha." }
          : {};

  const erroTermos = tentou && !aceito;

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
      {sucesso ? (
        <SucessoAcesso titulo="Conta criada" rodape="Levando você para o login...">
          {sucesso}
        </SucessoAcesso>
      ) : (
        <>
          <CabecalhoAcesso titulo="Crie sua conta">
            Comece gratuitamente e tenha acesso ao ecossistema TrocaTicket para descobrir, organizar e gerenciar eventos.
          </CabecalhoAcesso>

          <form
            onSubmit={(e) => {
              setTentou(true);
              handleRegister(e);
            }}
            onInvalidCapture={aoInvalido}
            className="tt-acesso__form"
          >
            {erro && (
              <AvisoAcesso key={erro} titulo="Não foi possível criar a conta">
                {erro}
              </AvisoAcesso>
            )}

            <fieldset className="tt-acesso__travado" disabled={enviando}>
              <EscolhaPerfil rotulo="Como você vai usar o TrocaTicket?" opcoes={perfis} valor={perfil} onChange={setPerfil} />

              <CampoAcesso
                rotulo="Nome completo"
                icone={User}
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                maxLength={120}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onBlur={tocar("nome")}
                required
                {...nomeCampo}
              />

              <CampoAcesso
                rotulo="E-mail"
                icone={Mail}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={tocar("email")}
                required
                {...emailCampo}
              />

              <div className="tt-acesso__dupla">
                <CampoAcesso
                  rotulo="Senha"
                  icone={Lock}
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  maxLength={72}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onBlur={tocar("senha")}
                  required
                  acao={<BotaoMostrarSenha visivel={showPass} onClick={() => setShowPass(!showPass)} />}
                  {...senhaCampo}
                />
                <CampoAcesso
                  rotulo="Confirmar senha"
                  icone={Lock}
                  type={showConf ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  maxLength={72}
                  value={conf}
                  onChange={(e) => setConf(e.target.value)}
                  onBlur={tocar("conf")}
                  required
                  acao={<BotaoMostrarSenha visivel={showConf} onClick={() => setShowConf(!showConf)} />}
                  {...confCampo}
                />
              </div>

              <div>
                <label className={`tt-acesso__termos${erroTermos ? " tt-acesso__termos--erro" : ""}`}>
                  <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} aria-invalid={erroTermos || undefined} />
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
                {erroTermos && (
                  <p className="tt-acesso__mensagem tt-acesso__mensagem--erro">
                    <Icone icone={CircleAlert} tamanho={14} />
                    Marque esta opção para continuar.
                  </p>
                )}
              </div>

              <button type="submit" className="tt-btn tt-btn--primary tt-btn--lg tt-acesso__largo" aria-busy={enviando || undefined} style={{ marginTop: "var(--esp-2)" }}>
                <ConteudoBotao carregando={enviando} rotulo="Criar conta" rotuloCarregando="Criando conta..." />
              </button>
            </fieldset>
          </form>

          <DivisorOu />

          <BotaoGoogle>Criar conta com Google</BotaoGoogle>
        </>
      )}
    </TelaAcesso>
  );
}
