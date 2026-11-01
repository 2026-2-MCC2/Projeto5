// Componentes visuais reaproveitados nas telas (fornecedor, organizador, admin, login e landing).
// Os estilos ficam em ui.css e usam os tokens de index.css. `style` continua funcionando em todos
// para ajustes pontuais das telas.
import { CircleAlert, CircleCheck, LoaderCircle, RefreshCw, Search, Star, Ticket, X } from "lucide-react";
import "./ui.css";

// Junta classes ignorando as vazias: classes("a", cond && "b") -> "a b"
const classes = (...lista) => lista.filter(Boolean).join(" ");

// Todos os ícones do projeto passam por aqui: traço fino e tamanho padronizado.
// Herdam a cor do texto (currentColor), então acompanham o tema de onde estão.
export function Icone({ icone: Componente, tamanho = 18, ...props }) {
  return <Componente size={tamanho} strokeWidth={1.75} aria-hidden="true" focusable="false" {...props} />;
}

// Ícone pequeno antes de um texto (data, local, convidados...).
export function TextoComIcone({ icone, tamanho = 16, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", ...style }}>
      <Icone icone={icone} tamanho={tamanho} style={{ flexShrink: 0 }} />
      {children}
    </span>
  );
}

// Ícone num círculo suave, usado no topo de modais e em estados vazios.
export function IconeDestaque({ icone, variante = "info" }) {
  return (
    <div className={`tt-icone-destaque tt-badge--${variante}`}>
      <Icone icone={icone} tamanho={24} />
    </div>
  );
}

// Quadradinho colorido do logo TrocaTicket.
export function MarcaLogo({ tamanho = 26 }) {
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 4, background: "var(--degrade-logo)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icone icone={Ticket} tamanho={Math.round(tamanho * 0.6)} />
    </div>
  );
}

// Botão só com ícone (fechar, remover). `rotulo` é lido por leitores de tela.
export function BotaoIcone({ icone, rotulo, onClick, cor = "var(--texto-fraco)", tamanho = 18 }) {
  return (
    <button type="button" className="tt-botao-icone" aria-label={rotulo} title={rotulo} onClick={onClick} style={{ color: cor }}>
      <Icone icone={icone} tamanho={tamanho} />
    </button>
  );
}

// Variantes: padrao, sucesso, info, selecionado. O espaçamento interno fica com cada tela.
export function Card({ children, variante = "padrao", style }) {
  return (
    <div className={classes("tt-card", variante !== "padrao" && `tt-card--${variante}`)} style={style}>
      {children}
    </div>
  );
}

export function CardTitulo({ children }) {
  return <h4 className="tt-card-titulo">{children}</h4>;
}

// Faixa de título no topo de um card, separada do conteúdo por uma borda.
export function CabecalhoCard({ titulo, sub, children }) {
  return (
    <div className="tt-card-cabecalho">
      <div>
        <h3>{titulo}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Linha picotada do ingresso, separando a parte "evento" da parte "valores" de um card.
// Use como filho direto de um Card com overflow: hidden. `fundo` é a cor de trás do card
// (normalmente o fundo da página), que aparece nos recortes laterais.
export function Picote({ fundo, style }) {
  return <hr className="tt-picote" aria-hidden="true" style={{ ...(fundo && { "--tt-picote-fundo": fundo }), ...style }} />;
}

// Rótulo pequeno acima de números e totais.
export function Rotulo({ children }) {
  return <div className="tt-rotulo">{children}</div>;
}

// `extra` aparece ao lado do título (ex.: badge de status); `children`, à direita da página.
export function TituloPagina({ titulo, sub, extra, children }) {
  return (
    <div className="tt-titulo-pagina">
      <div>
        <div className="tt-titulo-pagina__linha">
          <h2>{titulo}</h2>
          {extra}
        </div>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Valor numérico (dinheiro, quantidades) com algarismos de largura fixa, para alinhar em colunas.
export function Valor({ children, cor = "var(--verde-texto)", tamanho = "0.875rem", peso = 600, riscado = false }) {
  return (
    <span className="tt-valor" style={{ fontSize: tamanho, fontWeight: peso, color: cor, textDecoration: riscado ? "line-through" : "none" }}>
      {children}
    </span>
  );
}

// Card com um número de destaque (KPI).
export function Indicador({ rotulo, valor, cor = "var(--texto)", mono = true, tamanho = "1.5rem", detalhe, variante, riscado }) {
  return (
    <Card variante={variante}>
      <div className="tt-indicador">
        <Rotulo>{rotulo}</Rotulo>
        <span
          className={classes("tt-indicador__valor", mono && "tt-valor")}
          style={{ fontSize: tamanho, fontWeight: 700, color: cor, textDecoration: riscado ? "line-through" : "none" }}
        >
          {valor}
        </span>
        {detalhe && <div className="tt-indicador__detalhe">{detalhe}</div>}
      </div>
    </Card>
  );
}

// Lista de pares rótulo / valor, usada em resumos laterais.
export function ListaInfo({ itens }) {
  return (
    <dl className="tt-lista-info">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// Pares rótulo / valor num bloco com divisórias, usados nos modais de detalhes.
export function ListaDetalhes({ itens }) {
  return (
    <dl className="tt-lista-detalhes">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// Bolinha laranja com um número (ex.: aprovações pendentes).
export function Contador({ valor, grande = false }) {
  return <span className={classes("tt-contador", grande && "tt-contador--grande")}>{valor}</span>;
}

// Variantes: success, warning, error, info, accent, neutral.
// As que indicam um estado ganham uma bolinha antes do texto; neutral (ex.: categoria) não.
export function Badge({ children, variante = "neutral" }) {
  return <span className={classes("tt-badge", `tt-badge--${variante}`, variante !== "neutral" && "tt-badge--ponto")}>{children}</span>;
}

const variantePorStatus = {
  "Em andamento": "info",
  "Concluído": "success",
  "Rascunho": "neutral",
  "Aguardando Data": "warning",
  "Cancelado": "error",
  "Aguardando Aprovação": "accent",
  "Em análise": "warning",
  "Aprovada": "success",
  "Rejeitada": "error",
};

export function StatusBadge({ status }) {
  return <Badge variante={variantePorStatus[status] ?? "neutral"}>{status}</Badge>;
}

const tamanhoIconeBotao = { sm: 14, md: 16, lg: 18 };

// Variantes: primary, secondary, ghost, danger, accent. Tamanhos: sm, md, lg.
// `icone` aparece antes do texto e `iconeDepois` depois (ex.: seta de avançar).
// Com `carregando`, o botão fica desativado e o ícone vira um indicador girando.
export function Btn({ children, onClick, variante = "primary", tamanho = "md", disabled = false, carregando = false, icone, iconeDepois, style }) {
  return (
    <button
      type="button"
      className={`tt-btn tt-btn--${variante} tt-btn--${tamanho}`}
      onClick={onClick}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      style={style}
    >
      {carregando ? (
        <Icone icone={LoaderCircle} tamanho={tamanhoIconeBotao[tamanho]} className="tt-girando" />
      ) : (
        icone && <Icone icone={icone} tamanho={tamanhoIconeBotao[tamanho]} />
      )}
      {children}
      {iconeDepois && <Icone icone={iconeDepois} tamanho={tamanhoIconeBotao[tamanho]} />}
    </button>
  );
}

// Com `destacado`, a borda fica azul mesmo sem foco.
export function Input({ destacado = false, className, ...props }) {
  return <input {...props} className={classes("tt-campo", destacado && "tt-campo--destacado", className)} />;
}

// `opcoes`: lista de textos, ou de { valor, rotulo } quando o valor salvo é diferente do texto mostrado.
export function Select({ opcoes, className, ...props }) {
  return (
    <select {...props} className={classes("tt-campo", className)}>
      {opcoes.map((o) => (
        <option key={o.valor ?? o} value={o.valor ?? o}>
          {o.rotulo ?? o}
        </option>
      ))}
    </select>
  );
}

export function TextArea({ className, ...props }) {
  return <textarea rows={4} {...props} className={classes("tt-campo", className)} />;
}

// Campo de formulário com rótulo acima.
export function Campo({ rotulo, children }) {
  return (
    <label style={{ display: "block" }}>
      <span className="tt-rotulo-campo">{rotulo}</span>
      {children}
    </label>
  );
}

export function CampoBusca({ valor, onChange, placeholder }) {
  return (
    <div className="tt-busca">
      <Icone icone={Search} className="tt-busca__icone" />
      <Input type="search" aria-label={placeholder} placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Estado vazio. `children` (opcional) aparece embaixo do texto, para uma ação (ex.: botão de criar).
export function Vazio({ icone, titulo, texto, children }) {
  return (
    <div className="tt-vazio">
      <IconeDestaque icone={icone} variante="neutral" />
      {titulo && <h3>{titulo}</h3>}
      <p>{texto}</p>
      {children && <div className="tt-vazio__acoes">{children}</div>}
    </div>
  );
}

const iconeAviso = { erro: CircleAlert, sucesso: CircleCheck };

// Faixa de mensagem (erro ou sucesso), no mesmo estilo do erro do Login.
// Com `onFechar`, mostra um X para a pessoa dispensar a mensagem.
export function Aviso({ variante = "erro", children, onFechar, style }) {
  return (
    <div role={variante === "erro" ? "alert" : "status"} className={`tt-aviso tt-aviso--${variante}`} style={style}>
      <Icone icone={iconeAviso[variante]} tamanho={16} style={{ flexShrink: 0, marginTop: "3px" }} />
      <div style={{ flex: 1 }}>{children}</div>
      {onFechar && <BotaoIcone icone={X} rotulo="Fechar mensagem" onClick={onFechar} cor="currentColor" tamanho={14} />}
    </div>
  );
}

// Bloco cinza pulsando no lugar do conteúdo enquanto ele carrega (skeleton).
export function Esqueleto({ largura = "100%", altura = "14px", raio, style }) {
  return <span className="tt-esqueleto" aria-hidden="true" style={{ width: largura, height: altura, borderRadius: raio, ...style }} />;
}

// Falha ao carregar uma tela ou bloco: explica o que houve e oferece tentar de novo.
export function ErroCarregar({ titulo = "Não foi possível carregar", mensagem, onTentar }) {
  return (
    <div role="alert" className="tt-erro-carregar">
      <IconeDestaque icone={CircleAlert} variante="error" />
      <h3>{titulo}</h3>
      {mensagem && <p>{mensagem}</p>}
      {onTentar && (
        <Btn variante="secondary" icone={RefreshCw} onClick={onTentar}>
          Tentar de novo
        </Btn>
      )}
    </div>
  );
}

// Estado de carregando de uma tela ou card.
export function Carregando({ texto = "Carregando..." }) {
  return (
    <div role="status" className="tt-carregando">
      <Icone icone={LoaderCircle} tamanho={20} className="tt-girando" />
      {texto}
    </div>
  );
}

export function Modal({ children, onClose }) {
  return (
    <div className="tt-modal-fundo" onClick={onClose}>
      <div className="tt-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Topo de modal: conteúdo à esquerda e botão de fechar à direita.
export function CabecalhoModal({ children, onFechar }) {
  return (
    <div className="tt-modal-cabecalho">
      <div>{children}</div>
      <BotaoIcone icone={X} rotulo="Fechar" onClick={onFechar} tamanho={20} />
    </div>
  );
}

// Modal de confirmação com ícone, texto, um valor em destaque (opcional) e dois botões.
// `variante` define a cor do ícone (mesmas variantes do Badge).
// `varianteConfirmar` muda o botão de confirmar (ex.: "danger" para excluir); `carregando` e `erro`
// servem para ações que chamam a API.
export function ModalConfirmacao({ icone, variante, titulo, descricao, rotuloValor, valor, rotuloCancelar = "Cancelar", rotuloConfirmar, iconeConfirmar, varianteConfirmar = "primary", carregando = false, erro, onCancelar, onConfirmar }) {
  return (
    <Modal onClose={carregando ? undefined : onCancelar}>
      <div className="tt-confirmacao">
        <IconeDestaque icone={icone} variante={variante} />
        <h3>{titulo}</h3>
        <p>{descricao}</p>
        {rotuloValor && (
          <div className="tt-confirmacao__valor">
            <span>{rotuloValor}</span>
            <Valor peso={700}>{valor}</Valor>
          </div>
        )}
        {erro && (
          <Aviso variante="erro" style={{ marginBottom: "1rem", textAlign: "left" }}>
            {erro}
          </Aviso>
        )}
        <div className="tt-confirmacao__acoes">
          <Btn variante="secondary" onClick={onCancelar} disabled={carregando}>
            {rotuloCancelar}
          </Btn>
          <Btn variante={varianteConfirmar} onClick={onConfirmar} icone={iconeConfirmar} carregando={carregando}>
            {rotuloConfirmar}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// Nota de 0 a 5: estrelas cheias até a nota e só o contorno no resto.
export function Estrelas({ nota }) {
  const cheias = Math.round(nota);
  const texto = nota.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); // 4.6 -> "4,6"
  return (
    <span role="img" aria-label={`Nota ${texto} de 5`} className="tt-estrelas">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icone key={n} icone={Star} tamanho={14} fill={n <= cheias ? "currentColor" : "none"} />
      ))}
      <span className="tt-estrelas__nota">{texto}</span>
    </span>
  );
}

// Botão de seleção usado em filtros (`redondo`) e abas (`redondo={false}`).
export function Chip({ rotulo, ativo, onClick, redondo = true, icone }) {
  return (
    <button type="button" className={classes("tt-chip", !redondo && "tt-chip--aba", ativo && "tt-chip--ativo")} aria-pressed={!!ativo} onClick={onClick}>
      {icone && <Icone icone={icone} tamanho={14} />}
      {rotulo}
    </button>
  );
}

export function BarraProgresso({ porcentagem, cor = "var(--azul)", altura = "6px" }) {
  return (
    <div className="tt-barra" style={{ height: altura }}>
      <div className="tt-barra__preenchida" style={{ width: `${porcentagem}%`, background: cor }} />
    </div>
  );
}

// Barra de progresso com rótulo à esquerda e valor à direita, em cima da barra.
export function BarraRotulada({ rotulo, valor, porcentagem, altura }) {
  return (
    <div>
      <div className="tt-barra-rotulada__topo">
        <span>{rotulo}</span>
        <span>{valor}</span>
      </div>
      <BarraProgresso porcentagem={porcentagem} altura={altura} />
    </div>
  );
}

// Tabela com cabeçalho; em telas estreitas rola na horizontal em vez de estourar o card.
export function Tabela({ colunas, children, rodape }) {
  return (
    <div className="tt-tabela-rolagem">
      <table className="tt-tabela">
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {rodape && <tfoot>{rodape}</tfoot>}
      </table>
    </div>
  );
}

// Linha da tabela com borda embaixo, exceto na última.
export function Linha({ ultima, className, ...props }) {
  return <tr {...props} className={classes("tt-linha", ultima && "tt-linha--ultima", className)} />;
}

export function Celula({ children, colSpan, style }) {
  return (
    <td colSpan={colSpan} style={style}>
      {children}
    </td>
  );
}

// Faixa cinza no rodapé de um card com tabela (totais, ações).
export function RodapeCard({ children }) {
  return <div className="tt-card-rodape">{children}</div>;
}
