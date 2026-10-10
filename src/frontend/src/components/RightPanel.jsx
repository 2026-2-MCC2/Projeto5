import { Check } from "lucide-react";
import { Icone } from "./ui";

export default function RightPanel({ heading, sub, features, highlight }) {
    return (
      <div
        style={{
          flex: 1,
          background: "#0D0D0D",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem clamp(2.5rem, 6vw, 5rem)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-100px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
  
        <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: "1rem", position: "relative" }}>
          {heading}
        </h2>
        <p style={{ fontSize: "0.9375rem", color: "#9CA3AF", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "440px", position: "relative" }}>
          {sub}
        </p>
  
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1A1A1A", color: "#D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icone icone={f.icon} />
              </div>
              <div>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "0.9375rem", color: "#fff", marginBottom: "2px" }}>{f.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
  
          <div style={{ marginTop: "0.5rem", padding: "1.25rem", background: "#141414", border: "1px solid #222", borderRadius: "12px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #00D494, #3B82F6)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icone icone={Check} tamanho={16} />
            </div>
            <div>
              <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "0.9375rem", color: "#fff", marginBottom: "4px" }}>{highlight.title}</div>
              <div style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.5 }}>{highlight.desc}</div>
            </div>
          </div>
        </div>
  
        <div style={{ position: "absolute", bottom: "24px", left: "clamp(2.5rem, 6vw, 5rem)", right: "clamp(2.5rem, 6vw, 5rem)", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#4B5563" }}>
          <span>© 2025 TrocaTicket</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <button type="button" style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontFamily: "Inter", fontSize: "0.75rem" }}>Termos</button>
            <button type="button" style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontFamily: "Inter", fontSize: "0.75rem" }}>Privacidade</button>
          </div>
        </div>
      </div>
    );
  }