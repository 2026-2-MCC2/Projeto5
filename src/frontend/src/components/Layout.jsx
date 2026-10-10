import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Contador, Icone, MarcaLogo } from "./ui";
import { ROTULO_PERFIL } from "../data/perfis";

const estiloLink = (ativo) => ({
  position: "relative",
  padding: "6px 13px",
  borderRadius: "7px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  textDecoration: "none",
  background: ativo ? "var(--ativo-fundo)" : "transparent",
  border: `1px solid ${ativo ? "var(--ativo-borda)" : "transparent"}`,
  color: ativo ? "var(--ativo-texto)" : "var(--texto-suave)",
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

// Estrutura das áreas logadas: cabeçalho com navegação + a página da rota atual.
// `nav` é uma lista de { rotulo, para, end, contador }. O primeiro item é a página inicial da área.
// `contexto` fica disponível para as páginas via useOutletContext().
export default function Layout({ nav, contexto }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sairDaConta() {
    logout();
    navigate("/");
  }

  return (
    <div className="area-logada" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--fundo)", fontFamily: "Inter, sans-serif", color: "var(--texto)" }}>
      <header style={{ background: "var(--superficie)", borderBottom: "1px solid var(--borda)", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", height: "58px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Voltar"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", background: "var(--superficie-3)", border: "1px solid var(--borda)", color: "var(--texto-2)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", flexShrink: 0, transition: "background 0.15s, border-color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--borda)"; e.currentTarget.style.borderColor = "var(--borda-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--superficie-3)"; e.currentTarget.style.borderColor = "var(--borda)"; }}
          >
            <Icone icone={ChevronLeft} tamanho={16} />
            Voltar
          </button>

          <button
            type="button"
            onClick={() => navigate(nav[0].para)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, textAlign: "left" }}
          >
            <MarcaLogo />
            <div>
              <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "0.9375rem", color: "var(--texto)", lineHeight: 1.1 }}>TrocaTicket</div>
              <div style={{ fontSize: "0.5rem", color: "var(--texto-fraco)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>Eventos &amp; Ingressos</div>
            </div>
          </button>

          <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
            {nav.map((item) => (
              <NavLink
                key={item.para}
                to={item.para}
                end={item.end}
                style={({ isActive }) => estiloLink(isActive)}
                onMouseEnter={hoverLink("var(--superficie-2)", "var(--texto-2)")}
                onMouseLeave={hoverLink("transparent", "var(--texto-suave)")}
              >
                {item.rotulo}
                {item.contador > 0 && (
                  <span style={{ position: "absolute", top: "-6px", right: "-4px" }}>
                    <Contador valor={item.contador} />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "3px 9px", borderRadius: "5px", background: "var(--superficie-3)", color: "var(--texto-suave)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {ROTULO_PERFIL[user.perfil]}
            </span>
            <button
              type="button"
              onClick={sairDaConta}
              style={{ fontSize: "0.8125rem", color: "var(--texto-fraco)", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--texto-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--texto-fraco)")}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "2rem 1.5rem" }}><Outlet context={contexto} /></main>
    </div>
  );
}
