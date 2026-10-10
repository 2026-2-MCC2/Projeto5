import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Eye, EyeOff, LayoutDashboard, Lock, ShieldCheck, Ticket } from "lucide-react";
import RightPanel from "../components/RightPanel";
import { Icone, MarcaLogo, TextoComIcone } from "../components/ui";

const features = [
  { icon: LayoutDashboard, title: "Gerencie seus eventos", desc: "Organize informações, lotes e vendas em um único lugar." },
  { icon: Ticket, title: "Ingressos digitais", desc: "Acesse e acompanhe seus ingressos com segurança." },
  { icon: ShieldCheck, title: "Segurança em cada etapa", desc: "Sua conta e seus dados protegidos durante toda a experiência." },
];

const labelStyle = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--texto-2)",
  marginBottom: "6px",
};

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  borderRadius: "9px",
  background: "var(--superficie)",
  border: "1px solid var(--borda)",
  transition: "border-color 0.15s ease",
};

const inputInnerStyle = {
  flex: 1,
  background: "none",
  border: "none",
  outline: "none",
  fontSize: "0.9rem",
  color: "var(--texto)",
  fontFamily: "Inter",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    setErro("");
    try {
      const usuario = login(email, pass);
      navigate(`/${usuario.perfil}`); // organizador, fornecedor ou admin
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, sans-serif" }}>
      {/* ── ESQUERDA: formulário ── */}
      <div
        style={{
          flex: "0 0 48%",
          maxWidth: "48%",
          background: "var(--superficie-2)",
          display: "flex",
          flexDirection: "column",
          padding: "0 clamp(2rem, 5vw, 5rem)",
        }}
      >
        {/* Barra superior */}
        <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <MarcaLogo />
            <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "0.9375rem", color: "var(--texto)" }}>TrocaTicket</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/criar-conta")}
            style={{ fontSize: "0.8125rem", color: "var(--texto-suave)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--texto)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--texto-suave)")}
          >
            Criar conta
          </button>
        </div>

        {/* Formulário */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "var(--superficie-3)", border: "1px solid var(--borda)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--texto-suave)", letterSpacing: "0.06em", marginBottom: "1.5rem", width: "fit-content" }}>
            <Icone icone={Lock} tamanho={14} />
            Acesso seguro
          </div>

          <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(1.625rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--texto)", lineHeight: 1.2, margin: "0 0 10px" }}>
            Acesse sua conta
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--texto-suave)", lineHeight: 1.6, margin: "0 0 2rem" }}>
            Entre para acessar seu{" "}
            <span style={{ color: "#3B82F6", fontWeight: 500 }}>painel</span>, acompanhar seus{" "}
            <span style={{ color: "#F97316", fontWeight: 500 }}>ingressos</span>, eventos e todas as funcionalidades do{" "}
            <span style={{ color: "var(--texto-suave)" }}>TrocaTicket</span>.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
              {/* E-mail */}
              <div>
                <label style={labelStyle}>E-mail</label>
                <div style={inputWrapStyle}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, color: "var(--texto-fraco)" }}>
                    <path d="M1 3.5A1.5 1.5 0 012.5 2h10A1.5 1.5 0 0114 3.5v8A1.5 1.5 0 0112.5 13h-10A1.5 1.5 0 011 11.5v-8zM2.5 3L7.5 7.5 12.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputInnerStyle}
                    onFocus={(e) => (e.currentTarget.parentElement.style.borderColor = "var(--texto)")}
                    onBlur={(e) => (e.currentTarget.parentElement.style.borderColor = "var(--borda)")}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Senha</label>
                  <button
                    type="button"
                    style={{ fontSize: "0.75rem", color: "var(--texto-fraco)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--texto-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--texto-fraco)")}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div style={inputWrapStyle}>
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0, color: "var(--texto-fraco)" }}>
                    <rect x="1" y="7" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 7V4.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    style={inputInnerStyle}
                    onFocus={(e) => (e.currentTarget.parentElement.style.borderColor = "var(--texto)")}
                    onBlur={(e) => (e.currentTarget.parentElement.style.borderColor = "var(--borda)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                    className="tt-botao-icone"
                    style={{ color: "var(--texto-fraco)", padding: "2px" }}
                  >
                    <Icone icone={showPass ? EyeOff : Eye} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{ padding: "10px 14px", borderRadius: "9px", background: "var(--erro-fundo)", border: "1px solid var(--erro-borda)", color: "var(--erro-texto)", fontSize: "0.8125rem", marginBottom: "12px" }}>
                {erro}
              </div>
            )}

            {/* Botão entrar */}
            <button
              type="submit"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "10px", background: "var(--destaque)", border: "none", color: "var(--destaque-texto)", fontSize: "0.9375rem", fontWeight: 700, fontFamily: "Outfit", cursor: "pointer", marginBottom: "1.25rem", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Entrar
              <Icone icone={ArrowRight} />
            </button>
          </form>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--borda)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--texto-fraco)" }}>ou</span>
            <div style={{ flex: 1, height: "1px", background: "var(--borda)" }} />
          </div>

          {/* Google (apenas visual por enquanto) */}
          <button
            type="button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", borderRadius: "10px", background: "var(--superficie)", border: "1px solid var(--borda)", color: "var(--texto-2)", fontSize: "0.875rem", fontWeight: 500, fontFamily: "Inter", cursor: "pointer", marginBottom: "2rem", transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--borda-2)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--borda)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2A10.2 10.2 0 0017.52 8H9v2.97h4.84A4.12 4.12 0 0112.09 13l-.01.1 2.4 1.86.17.02C16.31 13.4 17.64 11.46 17.64 9.2z" fill="#4285F4" />
              <path d="M9 18a8.96 8.96 0 006.17-2.25l-2.93-2.26A5.36 5.36 0 019 14.64a5.39 5.39 0 01-5.08-3.71l-.1.01-2.49 1.93-.03.09A9 9 0 009 18z" fill="#34A853" />
              <path d="M3.92 10.93A5.45 5.45 0 013.63 9c0-.68.12-1.33.28-1.95l-.01-.11-2.52-1.96-.09.04A9 9 0 000 9c0 1.45.34 2.82.95 4.03l2.97-2.1z" fill="#FBBC05" />
              <path d="M9 3.58c1.32 0 2.21.57 2.72 1.05l1.99-1.94A8.97 8.97 0 009 0 9 9 0 00.95 4.98L3.9 7.08A5.4 5.4 0 019 3.58z" fill="#EA4335" />
            </svg>
            Entrar com Google
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--texto-fraco)", margin: 0 }}>
            Ainda não possui uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/criar-conta")}
              style={{ background: "none", border: "none", color: "var(--texto-2)", fontWeight: 600, cursor: "pointer", fontFamily: "Inter", fontSize: "0.875rem", textDecoration: "underline", textUnderlineOffset: "2px" }}
            >
              Criar conta
            </button>
          </p>
        </div>

        {/* Rodapé */}
        <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TextoComIcone icone={Lock} tamanho={14} style={{ fontSize: "0.75rem", color: "var(--borda-2)" }}>Seus dados são tratados de forma segura.</TextoComIcone>
        </div>
      </div>

      {/* ── DIREITA: painel escuro ── */}
      <RightPanel
        heading="Tudo o que você precisa para viver e gerenciar eventos."
        sub="Uma experiência simples e segura para organizadores e participantes, do primeiro acesso até a entrada no evento."
        features={features}
        highlight={{
          title: "Uma experiência centralizada",
          desc: "Descubra eventos, acompanhe pedidos e gerencie tudo diretamente pelo TrocaTicket.",
        }}
      />
    </div>
  );
}