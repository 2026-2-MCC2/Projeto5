// Componentes visuais reaproveitados nas telas internas (fornecedor, organizador, admin).

const AZUL = "#2563EB";
const BORDA = "#E5E7EB";

export function Card({ children, style }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDA}`, borderRadius: "12px", ...style }}>
      {children}
    </div>
  );
}

export function CardTitulo({ children }) {
  return (
    <h4 style={{ fontFamily: "Outfit", fontWeight: 700, color: "#111827", marginBottom: "14px", fontSize: "0.9375rem" }}>
      {children}
    </h4>
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

export function TituloPagina({ titulo, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        <h2 style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{titulo}</h2>
        {sub && <p style={{ fontSize: "0.875rem", color: "#9CA3AF", marginTop: "4px" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

const estilosBadge = {
  success: { background: "rgba(5,150,105,0.10)", color: "#059669" },
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
  borderRadius: "9px",
  background: "#F9FAFB",
  color: "#111827",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.15s ease",
};

export function Input({ destacado = false, style, ...props }) {
  return (
    <input
      {...props}
      {...bordaAoFocar(destacado)}
      style={{ ...estiloCampo, padding: "10px 14px", border: `1px solid ${destacado ? AZUL : BORDA}`, ...style }}
    />
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

export function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#FFFFFF", border: `1px solid ${BORDA}`, borderRadius: "16px", padding: "2rem", maxWidth: "460px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        {children}
      </div>
    </div>
  );
}

export function Estrelas({ nota }) {
  const cheias = Math.round(nota);
  return (
    <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.8125rem", color: "#D97706" }}>
      {"★".repeat(cheias)}
      {"☆".repeat(5 - cheias)}
      <span style={{ color: "#9CA3AF", marginLeft: "4px" }}>{nota.toFixed(1)}</span>
    </span>
  );
}

// Botão de seleção usado em filtros (`redondo`) e abas de ordenação.
export function Chip({ rotulo, ativo, onClick, redondo = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: redondo ? "6px 14px" : "8px 16px",
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

export function BarraProgresso({ porcentagem, cor, altura = "6px" }) {
  return (
    <div style={{ flex: 1, height: altura, borderRadius: "3px", background: "#F3F4F6", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${porcentagem}%`, background: cor, borderRadius: "3px" }} />
    </div>
  );
}

export function Tabela({ colunas, children }) {
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
    </table>
  );
}

// Linha da tabela com borda embaixo, exceto na última.
export function Linha({ ultima, style, ...props }) {
  return <tr {...props} style={{ borderBottom: ultima ? "none" : "1px solid #F3F4F6", ...style }} />;
}

export function Celula({ children, style }) {
  return <td style={{ padding: "14px 16px", ...style }}>{children}</td>;
}
