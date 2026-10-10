import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const rotuloPerfil = { organizador: "Organizador", fornecedor: "Fornecedor", admin: "Administrador" };

const estiloLink = (ativo) => ({
  position: "relative",
  padding: "6px 13px",
  borderRadius: "7px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  textDecoration: "none",
  background: ativo ? "#EFF6FF" : "transparent",
  border: `1px solid ${ativo ? "#BFDBFE" : "transparent"}`,
  color: ativo ? "#1D4ED8" : "#6B7280",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap",
});

// Muda a cor só dos links que não estão ativos.
function hoverLink(fundo, cor) {
  return (e) => {
    if (e.currentTarget.getAttribute("aria-current") === "page") return;
    e.currentTarget.style.background = fundo;
    e.currentTarget.style.color = cor;
  };
}

// Estrutura das áreas logadas: cabeçalho com navegação + conteúdo.
// `nav` é uma lista de { rotulo, para, end }. O primeiro item é a página inicial da área.
export default function Layout({ nav, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sairDaConta() {
    logout();
    navigate("/");
  }

  return (
    <div className="area-logada" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F5F6FA", fontFamily: "Inter, sans-serif", color: "#111827" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", height: "58px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Voltar"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#374151", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", flexShrink: 0, transition: "background 0.15s, border-color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar
          </button>

          <button
            type="button"
            onClick={() => navigate(nav[0].para)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, textAlign: "left" }}
          >
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "linear-gradient(135deg, #F97316, #A855F7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
              🎟
            </div>
            <div>
              <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.1 }}>TrocaTicket</div>
              <div style={{ fontSize: "0.5rem", color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>Eventos &amp; Ingressos</div>
            </div>
          </button>

          <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
            {nav.map((item) => (
              <NavLink
                key={item.para}
                to={item.para}
                end={item.end}
                style={({ isActive }) => estiloLink(isActive)}
                onMouseEnter={hoverLink("#F9FAFB", "#374151")}
                onMouseLeave={hoverLink("transparent", "#6B7280")}
              >
                {item.rotulo}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "3px 9px", borderRadius: "5px", background: "#F3F4F6", color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {rotuloPerfil[user.perfil]}
            </span>
            <button
              type="button"
              onClick={sairDaConta}
              style={{ fontSize: "0.8125rem", color: "#9CA3AF", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "2rem 1.5rem" }}>{children}</main>
    </div>
  );
}
