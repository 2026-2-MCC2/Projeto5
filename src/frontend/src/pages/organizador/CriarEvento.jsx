import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ClipboardList, Rocket, X } from "lucide-react";
import { Aviso, Card, CabecalhoCard, Btn, Chip, Icone, IconeDestaque, TextoComIcone, TituloPagina } from "../../components/ui";
import EditorItens from "../../components/EditorItens";
import FormularioEvento, { TituloSecao } from "../../components/FormularioEvento";
import { eventoDoFormulario, formularioVazio, problemasDoFormulario } from "../../utils/formularioEvento";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { criarEvento, novoItem } from "../../services/organizadorService";

const passos = ["Informações Básicas", "Composição de Custos", "Fornecedores", "Publicar"];

export default function CriarEvento() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [fornecedores, setFornecedores] = useState([]);
  const [itens, setItens] = useState([]);
  const [salvando, setSalvando] = useState(null); // status sendo salvo ("rascunho" ou "em_andamento")
  const [erro, setErro] = useState("");

  const problemas = problemasDoFormulario(formulario);
  // Para salvar (até como rascunho) a API exige os dados básicos; a categoria só é exigida para publicar.
  const podeSalvar = problemas.length === 0;

  // Etapas que precisam estar completas para publicar (Fornecedores é opcional).
  const etapaCompleta = [
    podeSalvar && Boolean(formulario.categoria),
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

  async function salvar(status) {
    setErro("");
    setSalvando(status);
    try {
      const evento = await criarEvento({ ...eventoDoFormulario(formulario), status }, itens);
      const mensagem = status === "rascunho" ? "Evento salvo como rascunho." : "Evento publicado com sucesso!";
      navigate(`/organizador/eventos/${evento.id}`, { state: { sucesso: mensagem } });
    } catch (err) {
      setErro(err.message);
      setSalvando(null);
    }
  }

  // Mensagem do botão desativado de "Salvar como Rascunho".
  const dicaRascunho = podeSalvar ? undefined : problemas[0];

  return (
    <>
      <TituloPagina titulo="Criar Novo Evento" sub="Preencha as informações para publicar seu evento">
        <Btn variante="ghost" tamanho="sm" icone={X} onClick={() => navigate("/organizador")}>
          Cancelar
        </Btn>
      </TituloPagina>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "4px" }}>
        {passos.map((p, i) => {
          const atual = i === passo;
          // Marca com um check as etapas já visitadas que estão completas.
          const feita = i < passo && etapaCompleta[i];
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => irPara(i)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "8px", background: atual ? "var(--ativo-fundo)" : "transparent", border: "none", cursor: "pointer" }}
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
                    background: feita ? "#2563EB" : atual ? "var(--ativo-borda)" : "var(--superficie-3)",
                    color: feita ? "#fff" : atual ? "var(--ativo-texto)" : "var(--texto-fraco)",
                    border: `2px solid ${feita || atual ? "#2563EB" : "var(--borda)"}`,
                  }}
                >
                  {feita ? <Icone icone={Check} tamanho={14} /> : i + 1}
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: atual ? 600 : 400, color: atual ? "var(--ativo-texto)" : feita ? "var(--texto-suave)" : "var(--texto-fraco)", whiteSpace: "nowrap" }}>{p}</span>
              </button>
              {i < passos.length - 1 && <div style={{ width: "20px", height: "2px", background: feita ? "#2563EB" : "var(--borda)", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      {passo === 0 && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <FormularioEvento valores={formulario} onChange={setFormulario} />

          <Card style={{ padding: "1.5rem" }}>
            <TituloSecao>Fornecedores que Pretende Orçar</TituloSecao>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIAS_FORNECEDOR.map((f) => {
                const ativo = fornecedores.includes(f);
                return <Chip key={f} rotulo={f} icone={ativo ? Check : undefined} ativo={ativo} onClick={() => alternarFornecedor(f)} />;
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
            <p style={{ color: "var(--texto-fraco)", fontSize: "0.875rem" }}>Nenhum fornecedor selecionado. Volte à primeira etapa para escolher.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {fornecedores.map((f) => (
                <div key={f} style={{ padding: "7px 14px", borderRadius: "8px", background: "var(--ativo-fundo)", border: "1px solid var(--ativo-borda)", color: "var(--ativo-texto)", fontSize: "0.875rem", fontWeight: 500 }}>
                  <TextoComIcone icone={Check}>{f}</TextoComIcone>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {passo === 3 && (
        <Card style={{ padding: "2.5rem", textAlign: "center" }}>
          <IconeDestaque icone={pendencias.length ? ClipboardList : Rocket} variante={pendencias.length ? "warning" : "info"} />
          <h3 style={{ fontFamily: "Outfit", fontSize: "1.5rem", fontWeight: 700, color: "var(--texto)", marginBottom: "8px" }}>
            {pendencias.length ? "Quase lá!" : "Pronto para publicar!"}
          </h3>
          {pendencias.length ? (
            <div style={{ maxWidth: "420px", margin: "0 auto 2rem" }}>
              <p style={{ color: "var(--texto-suave)", fontSize: "0.9375rem", marginBottom: "12px" }}>Complete estas etapas para publicar o evento:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pendencias.map((i) => (
                  <Btn key={i} variante="danger" iconeDepois={ArrowRight} onClick={() => irPara(i)}>
                    {i === 0 ? `Informações Básicas: ${problemas[0] ?? "escolha a categoria do evento"}` : "Composição de Custos: cada item precisa de descrição e custo"}
                  </Btn>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--texto-suave)", fontSize: "0.9375rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
              Seu evento será visível para os fornecedores selecionados, que poderão enviar propostas comerciais.
            </p>
          )}
          {erro && (
            <Aviso variante="erro" onFechar={() => setErro("")} style={{ maxWidth: "460px", margin: "0 auto 1.25rem", textAlign: "left" }}>
              {erro}
            </Aviso>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Btn variante="secondary" onClick={() => salvar("rascunho")} disabled={!podeSalvar || salvando !== null} carregando={salvando === "rascunho"}>
              {salvando === "rascunho" ? "Salvando..." : "Salvar como Rascunho"}
            </Btn>
            <Btn onClick={() => salvar("em_andamento")} disabled={pendencias.length > 0 || salvando !== null} carregando={salvando === "em_andamento"} icone={Rocket}>
              {salvando === "em_andamento" ? "Publicando..." : "Publicar Evento"}
            </Btn>
          </div>
        </Card>
      )}

      {erro && passo !== 3 && (
        <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginTop: "1.5rem" }}>
          {erro}
        </Aviso>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", flexWrap: "wrap", gap: "12px" }}>
        <span title={dicaRascunho}>
          <Btn variante="ghost" onClick={() => salvar("rascunho")} disabled={!podeSalvar || salvando !== null} carregando={salvando === "rascunho"}>
            {salvando === "rascunho" ? "Salvando..." : "Salvar como Rascunho"}
          </Btn>
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          {passo > 0 && (
            <Btn variante="secondary" icone={ArrowLeft} onClick={() => setPasso(passo - 1)}>
              Voltar
            </Btn>
          )}
          {passo < passos.length - 1 && (
            <Btn onClick={() => irPara(passo + 1)} disabled={!etapaCompleta[passo]} iconeDepois={ArrowRight}>
              Salvar e Continuar
            </Btn>
          )}
        </div>
      </div>
    </>
  );
}
