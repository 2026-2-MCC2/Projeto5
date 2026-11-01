// Peças visuais das telas de acesso (Login e Criar conta). Só aparência: estado e envio ficam nas páginas.
import { useId } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Icone, MarcaLogo } from "./ui";
import "./Acesso.css";

// Estrutura da tela: formulário à esquerda e `painel` (RightPanel) à direita.
// `linkTopo`: { pergunta, rotulo, para } — atalho no canto superior direito (ex.: "Já tem conta? Entrar").
export function TelaAcesso({ linkTopo, painel, children }) {
  const navigate = useNavigate();
  return (
    <div className="tt-acesso">
      <div className="tt-acesso__lado">
        <header className="tt-acesso__topo">
          <button type="button" className="tt-acesso__marca" onClick={() => navigate("/")}>
            <MarcaLogo tamanho={28} />
            TrocaTicket
          </button>
          {linkTopo && (
            <p className="tt-acesso__atalho">
              <span>{linkTopo.pergunta}</span>{" "}
              <button type="button" className="tt-acesso__link" onClick={() => navigate(linkTopo.para)}>
                {linkTopo.rotulo}
              </button>
            </p>
          )}
        </header>

        <main className="tt-acesso__principal">
          <div className="tt-acesso__caixa">{children}</div>
        </main>

        <footer className="tt-acesso__rodape">
          <Icone icone={Lock} tamanho={14} />
          Seus dados são tratados de forma segura.
        </footer>
      </div>
      {painel}
    </div>
  );
}

// Título e texto de abertura do formulário.
export function CabecalhoAcesso({ titulo, children }) {
  return (
    <div className="tt-acesso__cabecalho">
      <h1>{titulo}</h1>
      <p>{children}</p>
    </div>
  );
}

// Campo com rótulo e ícone à esquerda. `extra` fica ao lado do rótulo (ex.: "Esqueceu sua senha?")
// e `acao` dentro do campo, à direita (ex.: mostrar senha). O resto das props vai para o <input>.
export function CampoAcesso({ rotulo, icone, extra, acao, ...props }) {
  const id = useId();
  return (
    <div className="tt-acesso__campo">
      <div className="tt-acesso__rotulo-linha">
        <label htmlFor={id}>{rotulo}</label>
        {extra}
      </div>
      <div className={`tt-acesso__entrada${acao ? " tt-acesso__entrada--com-acao" : ""}`}>
        <Icone icone={icone} tamanho={18} className="tt-acesso__icone" />
        <input id={id} className="tt-campo" {...props} />
        {acao}
      </div>
    </div>
  );
}

export function BotaoMostrarSenha({ visivel, onClick }) {
  const rotulo = visivel ? "Ocultar senha" : "Mostrar senha";
  return (
    <button type="button" className="tt-acesso__olho" onClick={onClick} aria-label={rotulo} title={rotulo}>
      <Icone icone={visivel ? EyeOff : Eye} />
    </button>
  );
}

export function DivisorOu() {
  return (
    <div className="tt-acesso__divisor" role="separator">
      <span>ou</span>
    </div>
  );
}

// Botão do Google (ainda sem integração: só visual).
export function BotaoGoogle({ children }) {
  return (
    <button type="button" className="tt-btn tt-btn--secondary tt-btn--lg tt-acesso__largo">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M17.64 9.2A10.2 10.2 0 0017.52 8H9v2.97h4.84A4.12 4.12 0 0112.09 13l-.01.1 2.4 1.86.17.02C16.31 13.4 17.64 11.46 17.64 9.2z" fill="#4285F4" />
        <path d="M9 18a8.96 8.96 0 006.17-2.25l-2.93-2.26A5.36 5.36 0 019 14.64a5.39 5.39 0 01-5.08-3.71l-.1.01-2.49 1.93-.03.09A9 9 0 009 18z" fill="#34A853" />
        <path d="M3.92 10.93A5.45 5.45 0 013.63 9c0-.68.12-1.33.28-1.95l-.01-.11-2.52-1.96-.09.04A9 9 0 000 9c0 1.45.34 2.82.95 4.03l2.97-2.1z" fill="#FBBC05" />
        <path d="M9 3.58c1.32 0 2.21.57 2.72 1.05l1.99-1.94A8.97 8.97 0 009 0 9 9 0 00.95 4.98L3.9 7.08A5.4 5.4 0 019 3.58z" fill="#EA4335" />
      </svg>
      {children}
    </button>
  );
}
