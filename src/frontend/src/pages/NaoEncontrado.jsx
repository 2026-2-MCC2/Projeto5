import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, House, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Btn, Icone, MarcaLogo } from "../components/ui";

// Tela de erro 404.
// - Sozinha (rota que não existe): ocupa a tela toda, com a barra do logo como no Login.
// - `dentroDoLayout`: usada nas áreas logadas quando um registro não existe (ex.: evento apagado),
//   aparecendo dentro do Layout, sem repetir o logo.
export default function NaoEncontrado({
  titulo = "Página não encontrada",
  texto = "O endereço que você tentou acessar não existe ou foi removido. Confira se ele foi digitado corretamente.",
  voltarPara,
  rotuloVoltar,
  dentroDoLayout = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Quem está logado volta para o próprio painel; visitante volta para a página inicial.
  const destino = voltarPara ?? (user ? `/${user.perfil}` : "/");
  const rotuloDestino = rotuloVoltar ?? (user ? "Ir para o meu painel" : "Ir para o início");

  const conteudo = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: dentroDoLayout ? "3rem 0" : "0 1.5rem 4rem" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "var(--superficie-3)", border: "1px solid var(--borda)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--texto-suave)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
        <Icone icone={SearchX} tamanho={14} />
        Erro 404
      </div>

      {/* "404" com o mesmo preenchimento pontilhado do título da Landing; a cor acompanha o tema */}
      <div
        aria-hidden="true"
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: dentroDoLayout ? "clamp(5rem, 14vw, 8rem)" : "clamp(6rem, 20vw, 12rem)",
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          marginBottom: "1.5rem",
          background: "radial-gradient(circle, var(--texto) 38%, transparent 38%) 0 0 / 7px 7px",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          userSelect: "none",
        }}
      >
        404
      </div>

      <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--texto)", lineHeight: 1.2, margin: "0 0 10px" }}>
        {titulo}
      </h1>
      <p style={{ fontSize: "0.9375rem", color: "var(--texto-suave)", lineHeight: 1.6, maxWidth: "440px", margin: "0 0 1rem" }}>
        {texto}
      </p>
      <code style={{ display: "inline-block", maxWidth: "100%", overflowWrap: "anywhere", padding: "4px 10px", borderRadius: "7px", background: "var(--superficie-3)", border: "1px solid var(--borda)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--texto-fraco)", marginBottom: "2rem" }}>
        {pathname}
      </code>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <Btn variante="ghost" icone={ArrowLeft} onClick={() => navigate(-1)}>
          Voltar
        </Btn>
        <Btn icone={House} onClick={() => navigate(destino, { replace: true })}>
          {rotuloDestino}
        </Btn>
      </div>
    </div>
  );

  if (dentroDoLayout) return conteudo;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--fundo)", fontFamily: "Inter, sans-serif", color: "var(--texto)" }}>
      {/* Barra superior, igual à do Login */}
      <div style={{ height: "60px", display: "flex", alignItems: "center", padding: "0 clamp(1.5rem, 5vw, 5rem)" }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <MarcaLogo />
          <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "0.9375rem", color: "var(--texto)" }}>TrocaTicket</span>
        </button>
      </div>
      {conteudo}
    </div>
  );
}
