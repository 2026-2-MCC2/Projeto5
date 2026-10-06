import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";
import RightPanel from "../components/RightPanel";

const features = [
  { icon: "🏗", title: "Crie e organize eventos", desc: "Centralize informações, lotes, participantes e vendas." },
  { icon: "🎫", title: "Venda e gerencie ingressos", desc: "Controle seus ingressos e acompanhe os pedidos em um único ambiente." },
  { icon: "🔒", title: "Conta segura", desc: "Autenticação e proteção de dados integradas à plataforma." },
];

const labelStyle = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "6px",
};

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  borderRadius: "9px",
  background: "#fff",
  border: "1px solid #E5E7EB",
  transition: "border-color 0.15s ease",
};

const inputInnerStyle = {
  flex: 1,
  minWidth: 0,
  background: "none",
  border: "none",
  outline: "none",
  fontSize: "0.9rem",
  color: "#0A0A0A",
  fontFamily: "Inter",
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#374151",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "Inter",
  fontSize: "0.8125rem",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
  padding: 0,
};

const eyeBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#9CA3AF",
  fontSize: "0.75rem",
  padding: 0,
};

const focar = (e) => (e.currentTarget.parentElement.style.borderColor = "#0A0A0A");
const desfocar = (e) => (e.currentTarget.parentElement.style.borderColor = "#E5E7EB");

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

  function handleRegister(e) {
    e.preventDefault();
    setErro("");

    if (pass.length < 6) return setErro("A senha precisa ter no mínimo 6 caracteres.");
    if (pass !== conf) return setErro("As senhas não coincidem.");
    if (!aceito) return setErro("Aceite os Termos de Uso e a Política de Privacidade para continuar.");

    try {
      registrar({ nome, email, senha: pass, perfil });
      setSucesso("Conta criada! Aguarde a aprovação do administrador para entrar.");
      setTimeout(() => navigate("/login"), 2500);
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
          background: "#F9FAFB",
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
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "linear-gradient(135deg, #F97316, #A855F7, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
              🎟
            </div>
            <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "0.9375rem", color: "#0A0A0A" }}>TrocaTicket</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{ fontSize: "0.8125rem", color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0A0A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            Entrar
          </button>
        </div>

        {/* Formulário */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "#F3F4F6", border: "1px solid #E5E7EB", fontSize: "0.6875rem", fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", marginBottom: "1.25rem", width: "fit-content" }}>
            🎟 Criação de conta
          </div>

          <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(1.5rem, 3vw, 2.125rem)", fontWeight: 800, color: "#0A0A0A", lineHeight: 1.2, margin: "0 0 8px" }}>
            Crie sua conta
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#6B7280", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            Comece <span style={{ color: "#3B82F6", fontWeight: 500 }}>gratuitamente</span> e tenha{" "}
            <span style={{ color: "#F97316", fontWeight: 500 }}>acesso</span> ao ecossistema TrocaTicket para{" "}
            <span style={{ color: "#3B82F6", fontWeight: 500 }}>descobrir</span>, organizar e{" "}
            <span style={{ color: "#F97316", fontWeight: 500 }}>gerenciar</span> eventos.
          </p>

          {/* Seletor de perfil */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "1.25rem" }}>
            {["organizador", "fornecedor", "admin"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setPerfil(r)}
                style={{
                  padding: "4px 11px",
                  borderRadius: "6px",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  background: perfil === r ? "#0A0A0A" : "transparent",
                  border: `1px solid ${perfil === r ? "#0A0A0A" : "#D1D5DB"}`,
                  color: perfil === r ? "#fff" : "#9CA3AF",
                  transition: "all 0.15s ease",
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginBottom: "14px" }}>
              {/* Nome */}
              <div>
                <label style={labelStyle}>Nome completo</label>
                <div style={inputWrapStyle}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: "#9CA3AF" }}>
                    <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1 13c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputInnerStyle} onFocus={focar} onBlur={desfocar} />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label style={labelStyle}>E-mail</label>
                <div style={inputWrapStyle}>
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ flexShrink: 0, color: "#9CA3AF" }}>
                    <rect x="0.5" y="0.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M1 1.5L7 7L13 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputInnerStyle} onFocus={focar} onBlur={desfocar} />
                </div>
              </div>

              {/* Senha e confirmar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>Senha</label>
                  <div style={inputWrapStyle}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0, color: "#9CA3AF" }}>
                      <rect x="0.5" y="6.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M3 6.5V4a3 3 0 016 0v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      required
                      style={{ ...inputInnerStyle, fontSize: "0.8125rem" }}
                      onFocus={focar}
                      onBlur={desfocar}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirmar senha</label>
                  <div style={inputWrapStyle}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0, color: "#9CA3AF" }}>
                      <rect x="0.5" y="6.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M3 6.5V4a3 3 0 016 0v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                    <input
                      type={showConf ? "text" : "password"}
                      placeholder="Repita sua senha"
                      value={conf}
                      onChange={(e) => setConf(e.target.value)}
                      required
                      style={{ ...inputInnerStyle, fontSize: "0.8125rem" }}
                      onFocus={focar}
                      onBlur={desfocar}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={eyeBtnStyle}>
                      {showConf ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Termos */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "1.25rem", padding: "10px 12px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "9px" }}>
              <button
                type="button"
                onClick={() => setAceito(!aceito)}
                style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${aceito ? "#0A0A0A" : "#D1D5DB"}`, background: aceito ? "#0A0A0A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", marginTop: "1px", padding: 0, transition: "all 0.15s ease" }}
              >
                {aceito && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.55, margin: 0 }}>
                Ao criar sua conta, você concorda com nossos{" "}
                <button type="button" style={linkBtnStyle}>Termos de Uso</button> e com a{" "}
                <button type="button" style={linkBtnStyle}>Política de Privacidade</button>.
              </p>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ padding: "10px 14px", borderRadius: "9px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "0.8125rem", marginBottom: "12px" }}>
                {erro}
              </div>
            )}

            {/* Sucesso */}
            {sucesso && (
              <div style={{ padding: "10px 14px", borderRadius: "9px", background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D", fontSize: "0.8125rem", marginBottom: "12px" }}>
                {sucesso}
              </div>
            )}

            {/* Botão criar conta */}
            <button
              type="submit"
              disabled={!!sucesso}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "10px", background: "#0A0A0A", border: "none", color: "#fff", fontSize: "0.9375rem", fontWeight: 700, fontFamily: "Outfit", cursor: sucesso ? "default" : "pointer", marginBottom: "1.125rem", opacity: sucesso ? 0.6 : 1, transition: "opacity 0.15s" }}
            >
              Criar conta →
            </button>
          </form>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.125rem" }}>
            <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>ou</span>
            <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
          </div>

          {/* Google (apenas visual por enquanto) */}
          <button
            type="button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px", borderRadius: "10px", background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontSize: "0.875rem", fontWeight: 500, fontFamily: "Inter", cursor: "pointer", marginBottom: "1.5rem", transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2A10.2 10.2 0 0017.52 8H9v2.97h4.84A4.12 4.12 0 0112.09 13l-.01.1 2.4 1.86.17.02C16.31 13.4 17.64 11.46 17.64 9.2z" fill="#4285F4" />
              <path d="M9 18a8.96 8.96 0 006.17-2.25l-2.93-2.26A5.36 5.36 0 019 14.64a5.39 5.39 0 01-5.08-3.71l-.1.01-2.49 1.93-.03.09A9 9 0 009 18z" fill="#34A853" />
              <path d="M3.92 10.93A5.45 5.45 0 013.63 9c0-.68.12-1.33.28-1.95l-.01-.11-2.52-1.96-.09.04A9 9 0 000 9c0 1.45.34 2.82.95 4.03l2.97-2.1z" fill="#FBBC05" />
              <path d="M9 3.58c1.32 0 2.21.57 2.72 1.05l1.99-1.94A8.97 8.97 0 009 0 9 9 0 00.95 4.98L3.9 7.08A5.4 5.4 0 019 3.58z" fill="#EA4335" />
            </svg>
            Criar conta com Google
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#9CA3AF", margin: 0 }}>
            Já possui uma conta?{" "}
            <button type="button" onClick={() => navigate("/login")} style={{ ...linkBtnStyle, fontSize: "0.875rem" }}>
              Entrar
            </button>
          </p>
        </div>

        {/* Rodapé */}
        <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#D1D5DB" }}>🔒 Seus dados são tratados de forma segura.</span>
        </div>
      </div>

      {/* ── DIREITA: painel escuro ── */}
      <RightPanel
        heading="Sua experiência com eventos começa aqui."
        sub="Crie sua conta e tenha acesso a uma plataforma completa para eventos, ingressos, pedidos e experiências."
        features={features}
        highlight={{
          title: "Cadastro simples e rápido",
          desc: "Após criar sua conta, aguarde a aprovação do administrador para começar a usar a TrocaTicket.",
        }}
      />
    </div>
  );
}