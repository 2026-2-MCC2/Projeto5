import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";
import { cnpjValido, mascararCnpj, somenteDigitos } from "../utils/cnpj";
import { cpfValido, mascararCpf } from "../utils/cpf";
import { Briefcase, Building2, CalendarDays, CalendarPlus, CircleAlert, IdCard, Lock, Mail, ShieldCheck, Ticket, User } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { Icone } from "../components/ui";
import {
  AvisoAcesso,
  BotaoMostrarSenha,
  CabecalhoAcesso,
  CampoAcesso,
  ConteudoBotao,
  EscolhaPerfil,
  SeletorSegmentado,
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

// O organizador escolhe o documento; o fornecedor sempre usa CNPJ (a API exige).
const documentos = [
  { valor: "cnpj", icone: Building2, titulo: "CNPJ" },
  { valor: "cpf", icone: IdCard, titulo: "CPF" },
];

// Tamanho, máscara, validação e textos de cada documento.
const DOC = {
  cnpj: { digitos: 14, mascarar: mascararCnpj, valido: cnpjValido, placeholder: "00.000.000/0000-00", pattern: "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", vazio: "Informe o CNPJ da empresa." },
  cpf: { digitos: 11, mascarar: mascararCpf, valido: cpfValido, placeholder: "000.000.000-00", pattern: "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", vazio: "Informe o seu CPF." },
};

// Mesmas regras da API (src/backend/src/services/authService.js), só para avisar antes de enviar.
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;
const faltam = (n) => (n === 1 ? "Falta 1 caractere" : `Faltam ${n} caracteres`);

export default function CriarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoDocEscolhido, setTipoDoc] = useState("cnpj"); // só vale para organizador
  const [documento, setDocumento] = useState(""); // guardado já com máscara
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

  const tipoDoc = perfil === "organizador" ? tipoDocEscolhido : "cnpj";
  const doc = DOC[tipoDoc];
  const rotuloDoc = tipoDoc.toUpperCase();

  // Trocar de documento (ou de perfil, que pode forçar o CNPJ) limpa o campo:
  // a máscara e o tamanho de um não servem para o outro.
  function trocarTipoDoc(novo) {
    if (novo === tipoDoc) return;
    setTipoDoc(novo);
    setDocumento("");
    setTocados((t) => ({ ...t, documento: false }));
  }
  function trocarPerfil(novo) {
    if (novo !== "organizador" && tipoDoc !== "cnpj") {
      setDocumento("");
      setTocados((t) => ({ ...t, documento: false }));
    }
    setPerfil(novo);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErro("");

    if (!doc.valido(documento)) return setErro(`Informe um ${rotuloDoc} válido.`);
    if (pass.length < 6) return setErro("A senha precisa ter no mínimo 6 caracteres.");
    if (pass !== conf) return setErro("As senhas não coincidem.");
    if (!aceito) return setErro("Aceite os Termos de Uso e a Política de Privacidade para continuar.");

    setEnviando(true);
    try {
      await registrar({ nome, email, [tipoDoc]: somenteDigitos(documento), senha: pass, perfil });
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

  const digitosDoc = somenteDigitos(documento).length;
  const docCampo = doc.valido(documento)
    ? { estado: "ok", mensagem: `${rotuloDoc} válido.` }
    : !mostrar("documento") && digitosDoc < doc.digitos
      ? {}
      : !digitosDoc
        ? { estado: "erro", mensagem: doc.vazio }
        : digitosDoc < doc.digitos
          ? { estado: "erro", mensagem: `${faltam(doc.digitos - digitosDoc).replace("caractere", "dígito")} para completar o ${rotuloDoc}.` }
          : { estado: "erro", mensagem: `${rotuloDoc} inválido. Confira os números digitados.` };

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
              <EscolhaPerfil rotulo="Como você vai usar o TrocaTicket?" opcoes={perfis} valor={perfil} onChange={trocarPerfil} />

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

              <CampoAcesso
                rotulo={perfil === "organizador" ? "Documento" : "CNPJ"}
                extra={
                  perfil === "organizador" && (
                    <SeletorSegmentado rotulo="Tipo de documento" opcoes={documentos} valor={tipoDoc} onChange={trocarTipoDoc} />
                  )
                }
                icone={tipoDoc === "cpf" ? IdCard : Building2}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={doc.placeholder}
                maxLength={doc.placeholder.length}
                pattern={doc.pattern}
                value={documento}
                onChange={(e) => setDocumento(doc.mascarar(e.target.value))}
                onBlur={tocar("documento")}
                required
                {...docCampo}
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
        </>
      )}
    </TelaAcesso>
  );
}
