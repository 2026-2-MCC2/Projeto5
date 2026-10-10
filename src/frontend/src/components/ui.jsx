// Componentes visuais reaproveitados nas telas internas (fornecedor, organizador, admin).

const AZUL = "#2563EB";
const VERDE = "#059669";
const BORDA = "#E5E7EB";

const estilosCard = {
  padrao: { background: "#FFFFFF", border: `1px solid ${BORDA}` },
  sucesso: { background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.2)" },
  info: { background: "#EFF6FF", border: "1px solid #BFDBFE" },
  selecionado: { background: "#F5F9FF", border: "1px solid #BFDBFE" },
};

export function Card({ children, variante = "padrao", style }) {
  return <div style={{ borderRadius: "12px", ...estilosCard[variante], ...style }}>{children}</div>;
}

export function CardTitulo({ children }) {
  return (
    <h4 style={{ fontFamily: "Outfit", fontWeight: 700, color: "#111827", marginBottom: "14px", fontSize: "0.9375rem" }}>
      {children}
    </h4>
  );
}

// Faixa de título no topo de um card, separada do conteúdo por uma borda.
export function CabecalhoCard({ titulo, sub, children }) {
  return (
    <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDA}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <div>
        <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{titulo}</h3>
        {sub && <p style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginTop: "4px" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Rótulo pequeno em caixa alta, usado acima de números e totais.
export function Rotulo({ children }) {
  return (
    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
      {children}
    </div>
  );
}

// `extra` aparece ao lado do título (ex.: badge de status); `children`, à direita da página.
export function TituloPagina({ titulo, sub, extra, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{titulo}</h2>
          {extra}
        </div>
        {sub && <p style={{ fontSize: "0.875rem", color: "#9CA3AF", marginTop: "4px" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Valor numérico em fonte monoespaçada (dinheiro, quantidades).
export function Valor({ children, cor = VERDE, tamanho = "0.875rem", peso = 600, riscado = false }) {
  return (
    <span style={{ fontFamily: "JetBrains Mono", fontSize: tamanho, fontWeight: peso, color: cor, textDecoration: riscado ? "line-through" : "none" }}>
      {children}
    </span>
  );
}

// Card com um número de destaque (KPI).
export function Indicador({ rotulo, valor, cor, mono = true, tamanho = "1.5rem", detalhe, variante, riscado }) {
  return (
    <Card variante={variante} style={{ padding: "1.25rem 1.5rem" }}>
      <Rotulo>{rotulo}</Rotulo>
      {mono ? (
        <Valor cor={cor} tamanho={tamanho} peso={700} riscado={riscado}>
          {valor}
        </Valor>
      ) : (
        <div style={{ fontFamily: "Outfit", fontSize: tamanho, fontWeight: 700, color: cor }}>{valor}</div>
      )}
      {detalhe && <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>{detalhe}</div>}
    </Card>
  );
}

// Lista de pares rótulo / valor, usada em resumos laterais.
export function ListaInfo({ itens }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "0.8125rem" }}>
          <span style={{ color: "#9CA3AF" }}>{rotulo}</span>
          <span style={{ color: "#374151", fontWeight: 500, textAlign: "right" }}>{valor}</span>
        </div>
      ))}
    </div>
  );
}

const estilosBadge = {
  success: { background: "rgba(5,150,105,0.10)", color: VERDE },
  warning: { background: "rgba(217,119,6,0.10)", color: "#D97706" },
  error: { background: "rgba(220,38,38,0.10)", color: "#DC2626" },
  info: { background: "rgba(37,99,235,0.10)", color: AZUL },
  neutral: { background: "#F3F4F6", color: "#6B7280" },
  accent: { background: "rgba(234,88,12,0.10)", color: "#EA580C" },
};

export function Badge({ children, variante = "neutral" }) {
  return (
    <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "3px 8px", borderRadius: "5px", letterSpacing: "0.03em", whiteSpace: "nowrap", ...estilosBadge[variante] }}>
      {children}
    </span>
  );
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

const estilosBotao = {
  primary: { background: AZUL, color: "#fff", border: "none", fontWeight: 700 },
  secondary: { background: "#F3F4F6", color: "#374151", border: `1px solid ${BORDA}`, fontWeight: 600 },
  ghost: { background: "transparent", color: "#6B7280", border: `1px solid ${BORDA}`, fontWeight: 500 },
  danger: { background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.25)", fontWeight: 600 },
  accent: { background: "#EA580C", color: "#fff", border: "none", fontWeight: 700 },
};

const tamanhosBotao = {
  sm: { padding: "6px 12px", fontSize: "0.75rem", borderRadius: "7px" },
  md: { padding: "9px 17px", fontSize: "0.8125rem", borderRadius: "8px" },
  lg: { padding: "12px 22px", fontSize: "0.9375rem", borderRadius: "9px" },
};

export function Btn({ children, onClick, variante = "primary", tamanho = "md", disabled = false, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        fontFamily: "Outfit, sans-serif",
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        ...estilosBotao[variante],
        ...tamanhosBotao[tamanho],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Borda azul no foco. Com `destacado`, a borda continua azul depois que o campo perde o foco.
function bordaAoFocar(destacado) {
  return {
    onFocus: (e) => (e.currentTarget.style.borderColor = AZUL),
    onBlur: (e) => (e.currentTarget.style.borderColor = destacado ? AZUL : BORDA),
  };
}

const estiloCampo = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "9px",
  background: "#F9FAFB",
  color: "#111827",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.15s ease",
};

export function Input({ destacado = false, style, ...props }) {
  return <input {...props} {...bordaAoFocar(destacado)} style={{ ...estiloCampo, border: `1px solid ${destacado ? AZUL : BORDA}`, ...style }} />;
}

export function Select({ opcoes, style, ...props }) {
  return (
    <select {...props} {...bordaAoFocar(false)} style={{ ...estiloCampo, border: `1px solid ${BORDA}`, ...style }}>
      {opcoes.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function TextArea({ style, ...props }) {
  return (
    <textarea
      rows={4}
      {...props}
      {...bordaAoFocar(false)}
      style={{ ...estiloCampo, padding: "11px 14px", border: `1px solid ${BORDA}`, resize: "vertical", fontFamily: "Inter", lineHeight: 1.5, ...style }}
    />
  );
}

// Campo de formulário com rótulo em caixa alta.
export function Campo({ rotulo, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {rotulo}
      </span>
      {children}
    </label>
  );
}

export function CampoBusca({ valor, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>🔍</span>
      <Input placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} style={{ paddingLeft: "36px" }} />
    </div>
  );
}

export function Vazio({ icone, texto }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#9CA3AF" }}>
      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{icone}</div>
      <p>{texto}</p>
    </div>
  );
}

export function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#FFFFFF", border: `1px solid ${BORDA}`, borderRadius: "16px", padding: "2rem", maxWidth: "460px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        {children}
      </div>
    </div>
  );
}

// Modal de confirmação com ícone, texto, um valor em destaque e dois botões.
export function ModalConfirmacao({ icone, titulo, descricao, rotuloValor, valor, rotuloCancelar = "Cancelar", rotuloConfirmar, onCancelar, onConfirmar }) {
  return (
    <Modal onClose={onCancelar}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{icone}</div>
        <h3 style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>{titulo}</h3>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "1.25rem" }}>{descricao}</p>
        <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "12px", marginBottom: "1.5rem", border: `1px solid ${BORDA}`, display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "#6B7280" }}>{rotuloValor}</span>
          <Valor peso={700}>{valor}</Valor>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variante="ghost" style={{ flex: 1 }} onClick={onCancelar}>
            {rotuloCancelar}
          </Btn>
          <Btn style={{ flex: 1 }} onClick={onConfirmar}>
            {rotuloConfirmar}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

export function Estrelas({ nota }) {
  const cheias = Math.round(nota);
  return (
    <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.8125rem", color: "#D97706", whiteSpace: "nowrap" }}>
      {"★".repeat(cheias)}
      {"☆".repeat(5 - cheias)}
      <span style={{ color: "#9CA3AF", marginLeft: "4px" }}>{nota.toFixed(1)}</span>
    </span>
  );
}

// Botão de seleção usado em filtros (`redondo`) e abas.
export function Chip({ rotulo, ativo, onClick, redondo = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: redondo ? "6px 14px" : "7px 14px",
        borderRadius: redondo ? "999px" : "8px",
        fontSize: "0.8125rem",
        fontWeight: 500,
        background: ativo ? "#EFF6FF" : redondo ? "#F9FAFB" : "transparent",
        border: `1px solid ${ativo ? "#BFDBFE" : BORDA}`,
        color: ativo ? "#1D4ED8" : "#6B7280",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {rotulo}
    </button>
  );
}

export function BarraProgresso({ porcentagem, cor = "linear-gradient(90deg, #2563EB, #3B82F6)", altura = "6px" }) {
  return (
    <div style={{ flex: 1, height: altura, borderRadius: "3px", background: "#F3F4F6", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${porcentagem}%`, background: cor, borderRadius: "3px", transition: "width 0.5s ease" }} />
    </div>
  );
}

// Barra de progresso com rótulo à esquerda e valor à direita, em cima da barra.
export function BarraRotulada({ rotulo, valor, porcentagem, altura }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "5px" }}>
        <span style={{ color: "#6B7280" }}>{rotulo}</span>
        <span style={{ fontFamily: "JetBrains Mono", color: AZUL }}>{valor}</span>
      </div>
      <BarraProgresso porcentagem={porcentagem} altura={altura} />
    </div>
  );
}

export function Tabela({ colunas, children, rodape }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#F9FAFB" }}>
          {colunas.map((c) => (
            <th key={c} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${BORDA}` }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
      {rodape && <tfoot>{rodape}</tfoot>}
    </table>
  );
}

// Linha da tabela com borda embaixo, exceto na última.
export function Linha({ ultima, style, ...props }) {
  return <tr {...props} style={{ borderBottom: ultima ? "none" : "1px solid #F3F4F6", ...style }} />;
}

export function Celula({ children, colSpan, style }) {
  return (
    <td colSpan={colSpan} style={{ padding: "14px 16px", ...style }}>
      {children}
    </td>
  );
}

// Faixa cinza no rodapé de um card com tabela (totais, ações).
export function RodapeCard({ children }) {
  return (
    <div style={{ padding: "14px 16px", background: "#F9FAFB", borderTop: `1px solid ${BORDA}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {children}
    </div>
  );
}
