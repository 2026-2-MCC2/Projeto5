// Peças visuais das telas de acesso (Login e Criar conta). Só aparência: estado e envio ficam nas páginas.
import { useId } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
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

const iconeEstado = { erro: CircleAlert, ok: CircleCheck };

// Campo com rótulo e ícone à esquerda. `extra` fica ao lado do rótulo (ex.: "Esqueceu sua senha?")
// e `acao` dentro do campo, à direita (ex.: mostrar senha). O resto das props vai para o <input>.
// Validação visual: `estado` ("erro" | "ok") pinta a borda e mostra um ícone; `mensagem` aparece embaixo
// (em vermelho no erro, verde no ok, cinza sem estado, como dica).
export function CampoAcesso({ rotulo, icone, extra, acao, estado, mensagem, ...props }) {
  const id = useId();
  const idMensagem = `${id}-mensagem`;
  const classes = ["tt-acesso__entrada", acao && "tt-acesso__entrada--com-acao", estado && `tt-acesso__entrada--${estado}`].filter(Boolean).join(" ");
  return (
    <div className="tt-acesso__campo">
      <div className="tt-acesso__rotulo-linha">
        <label htmlFor={id}>{rotulo}</label>
        {extra}
      </div>
      <div className={classes}>
        <Icone icone={icone} tamanho={18} className="tt-acesso__icone" />
        <input id={id} className="tt-campo" aria-invalid={estado === "erro" || undefined} aria-describedby={mensagem ? idMensagem : undefined} {...props} />
        {acao ?? (estado && <Icone icone={iconeEstado[estado]} tamanho={18} className="tt-acesso__status" />)}
      </div>
      {mensagem && (
        <p id={idMensagem} className={`tt-acesso__mensagem${estado ? ` tt-acesso__mensagem--${estado}` : ""}`}>
          {estado && <Icone icone={iconeEstado[estado]} tamanho={14} />}
          {mensagem}
        </p>
      )}
    </div>
  );
}

// Escolha curta entre poucas opções, em formato de pílula (ex.: CNPJ | CPF).
// Rádios de verdade: Tab entra no grupo e as setas trocam a opção.
// `opcoes`: lista de { valor, titulo, icone? }.
export function SeletorSegmentado({ rotulo, opcoes, valor, onChange }) {
  const nome = useId();
  return (
    <div className="tt-acesso__segmentos" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => (
        <label key={o.valor} className={`tt-acesso__segmento${valor === o.valor ? " tt-acesso__segmento--ativo" : ""}`}>
          <input type="radio" name={nome} value={o.valor} checked={valor === o.valor} onChange={() => onChange(o.valor)} />
          {o.icone && <Icone icone={o.icone} tamanho={14} />}
          {o.titulo}
        </label>
      ))}
    </div>
  );
}

// Escolha de perfil em cartões grandes (rádios de verdade, acessíveis pelo teclado).
// `opcoes`: lista de { valor, icone, titulo, texto }.
export function EscolhaPerfil({ rotulo, opcoes, valor, onChange, desativado }) {
  const nome = useId();
  return (
    <fieldset className="tt-acesso__perfis" disabled={desativado}>
      <legend>{rotulo}</legend>
      <div className="tt-acesso__perfis-grade">
        {opcoes.map((o) => (
          <label key={o.valor} className={`tt-acesso__perfil${valor === o.valor ? " tt-acesso__perfil--ativo" : ""}`}>
            <input type="radio" name={nome} value={o.valor} checked={valor === o.valor} onChange={() => onChange(o.valor)} />
            <span className="tt-acesso__perfil-icone">
              <Icone icone={o.icone} tamanho={20} />
            </span>
            <span className="tt-acesso__perfil-textos">
              <strong>{o.titulo}</strong>
              <span>{o.texto}</span>
            </span>
            <span className="tt-acesso__perfil-marca" aria-hidden="true">
              <Icone icone={Check} tamanho={14} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Mensagem de erro ou sucesso do formulário, com título. Usa `key` diferente a cada erro
// (ver páginas) para a animação de "balançar" tocar de novo quando o erro muda.
export function AvisoAcesso({ variante = "erro", titulo, children }) {
  return (
    <div role={variante === "erro" ? "alert" : "status"} className={`tt-acesso__aviso tt-acesso__aviso--${variante}`}>
      <Icone icone={variante === "erro" ? CircleAlert : CircleCheck} tamanho={20} />
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

// Tela de conta criada: aparece no lugar do formulário enquanto a página leva para o login.
export function SucessoAcesso({ titulo, children, rodape }) {
  return (
    <div role="status" className="tt-acesso__sucesso">
      <span className="tt-acesso__sucesso-icone">
        <Icone icone={CircleCheck} tamanho={32} />
      </span>
      <h2>{titulo}</h2>
      <p>{children}</p>
      <div className="tt-acesso__sucesso-barra" aria-hidden="true">
        <span />
      </div>
      <span className="tt-acesso__sucesso-rodape">{rodape}</span>
    </div>
  );
}

// Texto do botão de enviar com indicador de carregando.
export function ConteudoBotao({ carregando, rotulo, rotuloCarregando }) {
  return carregando ? (
    <>
      <Icone icone={LoaderCircle} tamanho={18} className="tt-girando" />
      {rotuloCarregando}
    </>
  ) : (
    <>
      {rotulo}
      <Icone icone={ArrowRight} tamanho={18} />
    </>
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

