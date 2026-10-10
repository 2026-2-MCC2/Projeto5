import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CabecalhoCard, Btn, Campo, Chip, Input, TituloPagina } from "../../components/ui";
import EditorItens from "../../components/EditorItens";
import { CATEGORIAS_EVENTO, CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { criarEvento, novoItem } from "../../services/organizadorService";

const passos = ["Informações Básicas", "Composição de Custos", "Fornecedores", "Publicar"];

const estiloCampoBranco = { background: "#FFFFFF", padding: "10px 13px", borderRadius: "8px" };

function TituloSecao({ children }) {
  return <h3 style={{ fontFamily: "Outfit", fontSize: "1.0625rem", fontWeight: 700, color: "#111827", marginBottom: "1.25rem" }}>{children}</h3>;
}

export default function CriarEvento() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [convidados, setConvidados] = useState("");
  const [local, setLocal] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [itens, setItens] = useState([]);

  // Etapas que precisam estar completas para publicar (Fornecedores é opcional).
  const etapaCompleta = [
    Boolean(nome && data && categoria),
    itens.length > 0 && itens.every((i) => i.descricao && i.estimado > 0),
    true,
  ];
  const pendencias = [0, 1].filter((i) => !etapaCompleta[i]);

  function alternarFornecedor(f) {
    setFornecedores(fornecedores.includes(f) ? fornecedores.filter((x) => x !== f) : [...fornecedores, f]);
  }

  function irPara(destino) {
    // Ao entrar na composição de custos pela primeira vez, sugere um item para cada fornecedor escolhido.
    if (destino > 0 && itens.length === 0) {
      setItens((fornecedores.length ? fornecedores : [CATEGORIAS_FORNECEDOR[0]]).map(novoItem));
    }
    setPasso(destino);
  }

  function salvar(status) {
    criarEvento({ nome, data, local, convidados: Number(convidados) || 0, categoria, itens, status });
    navigate("/organizador");
  }

  return (
    <>
      <TituloPagina titulo="Criar Novo Evento" sub="Preencha as informações para publicar seu evento">
        <Btn variante="ghost" tamanho="sm" onClick={() => navigate("/organizador")}>
          ✕ Cancelar
        </Btn>
      </TituloPagina>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "4px" }}>
        {passos.map((p, i) => {
          const atual = i === passo;
          // Marca com ✓ as etapas já visitadas que estão completas.
          const feita = i < passo && etapaCompleta[i];
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => irPara(i)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "8px", background: atual ? "#EFF6FF" : "transparent", border: "none", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    background: feita ? "#2563EB" : atual ? "#BFDBFE" : "#F3F4F6",
                    color: feita ? "#fff" : atual ? "#1D4ED8" : "#9CA3AF",
                    border: `2px solid ${feita || atual ? "#2563EB" : "#E5E7EB"}`,
                  }}
                >
                  {feita ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: atual ? 600 : 400, color: atual ? "#1D4ED8" : feita ? "#6B7280" : "#9CA3AF", whiteSpace: "nowrap" }}>{p}</span>
              </button>
              {i < passos.length - 1 && <div style={{ width: "20px", height: "2px", background: feita ? "#2563EB" : "#E5E7EB", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      {passo === 0 && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <Card style={{ padding: "1.5rem" }}>
            <TituloSecao>Informações Básicas</TituloSecao>
            <div style={{ display: "grid", gap: "14px" }}>
              <Campo rotulo="Nome do Evento *">
                <Input placeholder="Ex: Festival Gastronômico SP 2025" value={nome} onChange={(e) => setNome(e.target.value)} style={estiloCampoBranco} />
              </Campo>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Campo rotulo="Data do Evento *">
                  <Input type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ ...estiloCampoBranco, colorScheme: "light" }} />
                </Campo>
                <Campo rotulo="Nº de Convidados">
                  <Input type="number" min="0" placeholder="Ex: 500" value={convidados} onChange={(e) => setConvidados(e.target.value)} style={estiloCampoBranco} />
                </Campo>
              </div>
              <Campo rotulo="Local do Evento">
                <Input placeholder="Ex: Parque Ibirapuera, São Paulo" value={local} onChange={(e) => setLocal(e.target.value)} style={estiloCampoBranco} />
              </Campo>
            </div>
          </Card>

          <Card style={{ padding: "1.5rem" }}>
            <TituloSecao>Categoria do Evento *</TituloSecao>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
              {CATEGORIAS_EVENTO.map((c) => {
                const ativa = categoria === c.rotulo;
                return (
                  <button
                    key={c.rotulo}
                    type="button"
                    onClick={() => setCategoria(c.rotulo)}
                    style={{ padding: "16px 10px", borderRadius: "10px", textAlign: "center", background: ativa ? "#EFF6FF" : "#F9FAFB", border: `2px solid ${ativa ? "#2563EB" : "#E5E7EB"}`, color: ativa ? "#1D4ED8" : "#6B7280", cursor: "pointer", transition: "all 0.15s" }}
                  >
                    <div style={{ fontSize: "1.375rem", marginBottom: "5px" }}>{c.icone}</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{c.rotulo}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: "1.5rem" }}>
            <TituloSecao>Fornecedores que Pretende Orçar</TituloSecao>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIAS_FORNECEDOR.map((f) => {
                const ativo = fornecedores.includes(f);
                return <Chip key={f} rotulo={`${ativo ? "✓ " : ""}${f}`} ativo={ativo} onClick={() => alternarFornecedor(f)} />;
              })}
            </div>
          </Card>
        </div>
      )}

      {passo === 1 && (
        <Card style={{ overflow: "hidden" }}>
          <CabecalhoCard titulo="Composição de Custos" sub="Liste os itens do evento e quanto você estima gastar em cada um" />
          <EditorItens itens={itens} onChange={setItens} />
        </Card>
      )}

      {passo === 2 && (
        <Card style={{ padding: "1.5rem" }}>
          <TituloSecao>Fornecedores Selecionados</TituloSecao>
          {fornecedores.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Nenhum fornecedor selecionado. Volte à primeira etapa para escolher.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {fornecedores.map((f) => (
                <div key={f} style={{ padding: "7px 14px", borderRadius: "8px", background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8", fontSize: "0.875rem", fontWeight: 500 }}>
                  ✓ {f}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {passo === 3 && (
        <Card style={{ padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{pendencias.length ? "📝" : "🚀"}</div>
          <h3 style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            {pendencias.length ? "Quase lá!" : "Pronto para publicar!"}
          </h3>
          {pendencias.length ? (
            <div style={{ maxWidth: "420px", margin: "0 auto 2rem" }}>
              <p style={{ color: "#6B7280", fontSize: "0.9375rem", marginBottom: "12px" }}>Complete estas etapas para publicar o evento:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pendencias.map((i) => (
                  <Btn key={i} variante="danger" onClick={() => irPara(i)}>
                    {i === 0 ? "Informações Básicas: preencha nome, data e categoria" : "Composição de Custos: cada item precisa de descrição e custo"} →
                  </Btn>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6B7280", fontSize: "0.9375rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
              Seu evento será visível para os fornecedores selecionados, que poderão enviar propostas comerciais.
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Btn variante="secondary" onClick={() => salvar("Rascunho")} disabled={!nome || !data}>
              Salvar como Rascunho
            </Btn>
            <Btn onClick={() => salvar("Em andamento")} disabled={pendencias.length > 0}>
              🚀 Publicar Evento
            </Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", flexWrap: "wrap", gap: "12px" }}>
        <Btn variante="ghost" onClick={() => salvar("Rascunho")} disabled={!nome || !data}>
          Salvar como Rascunho
        </Btn>
        <div style={{ display: "flex", gap: "10px" }}>
          {passo > 0 && (
            <Btn variante="secondary" onClick={() => setPasso(passo - 1)}>
              ← Voltar
            </Btn>
          )}
          {passo < passos.length - 1 && (
            <Btn onClick={() => irPara(passo + 1)} disabled={!etapaCompleta[passo]}>
              Salvar e Continuar →
            </Btn>
          )}
        </div>
      </div>
    </>
  );
}
