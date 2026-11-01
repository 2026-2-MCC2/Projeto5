import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Rocket, Users, X } from "lucide-react";
import { Aviso, Card, CabecalhoCard, Btn, Chip, Icone, TituloPagina, Vazio } from "../../components/ui";
import EditorItens from "../../components/EditorItens";
import FormularioEvento, { TituloSecao } from "../../components/FormularioEvento";
import { CartaoEvento, Etapas, TicketCenarios } from "../../components/organizador";
import { eventoDoFormulario, formularioVazio, problemasDoFormulario } from "../../utils/formularioEvento";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";
import { criarEvento, novoItem, somaEstimado } from "../../services/organizadorService";

const passos = ["Informações básicas", "Composição de custos", "Fornecedores", "Publicar"];

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

  // O que falta em cada etapa, mostrado ao lado do botão de continuar.
  const pendenciaDaEtapa = [
    problemas[0] ?? "Escolha a categoria do evento.",
    "Cada item precisa de descrição e custo estimado.",
  ];

  const totalEstimado = somaEstimado(itens);
  const etapasFeitas = [0, 1, 2].filter((i) => i < passo && etapaCompleta[i]);

  // Prévia do cartão como ele vai aparecer em "Meus Eventos" depois de publicado.
  const previa = {
    nome: formulario.nome,
    status: "em_andamento",
    data_inicio: formulario.data_inicio,
    local: formulario.local,
    categoria: formulario.categoria,
    publico_minimo: formulario.publico_minimo,
    publico_maximo: formulario.publico_maximo,
    orcamento: totalEstimado,
    total_propostas: 0,
  };

  return (
    <>
      <TituloPagina titulo="Criar Novo Evento" sub="Preencha as informações e publique para receber propostas">
        <Btn variante="ghost" tamanho="sm" icone={X} onClick={() => navigate("/organizador")}>
          Cancelar
        </Btn>
      </TituloPagina>

      <Etapas etapas={passos} atual={passo} feitas={etapasFeitas} onIr={irPara} />

      {passo === 0 && (
        <div style={{ display: "grid", gap: "var(--esp-6)" }}>
          <FormularioEvento valores={formulario} onChange={setFormulario} />

          <Card style={{ padding: "var(--esp-8)" }}>
            <TituloSecao>Fornecedores que pretende orçar</TituloSecao>
            <p style={{ fontSize: "var(--tam-sm)", color: "var(--texto-suave)", margin: "calc(-1 * var(--esp-3)) 0 var(--esp-4)" }}>
              Opcional. Cada tipo escolhido vira um item sugerido na composição de custos.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--esp-2)" }}>
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
          <CabecalhoCard titulo="Composição de custos" sub="Liste os itens do evento e quanto você estima gastar em cada um" />
          <EditorItens itens={itens} onChange={setItens} />
        </Card>
      )}

      {passo === 2 && (
        <Card style={{ padding: "var(--esp-8)" }}>
          <TituloSecao>Fornecedores selecionados</TituloSecao>
          {fornecedores.length === 0 ? (
            <Vazio icone={Users} titulo="Nenhum tipo de fornecedor escolhido" texto="Esta etapa é opcional. Se quiser, volte à primeira etapa e escolha os tipos de fornecedor.">
              <Btn variante="secondary" icone={ArrowLeft} onClick={() => irPara(0)}>
                Escolher fornecedores
              </Btn>
            </Vazio>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--esp-2)" }}>
              {fornecedores.map((f) => (
                <Chip key={f} rotulo={f} icone={Check} ativo onClick={() => alternarFornecedor(f)} />
              ))}
            </div>
          )}
        </Card>
      )}

      {passo === 3 && (
        <div className="tt-detalhes">
          <div className="tt-detalhes__principal">
            <Card style={{ padding: "var(--esp-8)" }}>
              <TituloSecao>{pendencias.length ? "Quase lá" : "Pronto para publicar"}</TituloSecao>
              {pendencias.length ? (
                <>
                  <p style={{ color: "var(--texto-suave)", marginBottom: "var(--esp-4)" }}>Complete estas etapas para publicar o evento:</p>
                  <div style={{ display: "grid", gap: "var(--esp-2)" }}>
                    {pendencias.map((i) => (
                      <button key={i} type="button" className="tt-btn tt-btn--danger tt-btn--md" style={{ justifyContent: "space-between", whiteSpace: "normal", textAlign: "left", padding: "var(--esp-3) var(--esp-4)" }} onClick={() => irPara(i)}>
                        <span>
                          <strong>{passos[i]}:</strong> {pendenciaDaEtapa[i]}
                        </span>
                        <Icone icone={ArrowRight} tamanho={16} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: "var(--texto-suave)" }}>Seu evento será visível para os fornecedores selecionados, que poderão enviar propostas comerciais.</p>
              )}

              {erro && (
                <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginTop: "var(--esp-5)" }}>
                  {erro}
                </Aviso>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--esp-3)", marginTop: "var(--esp-6)" }}>
                <Btn variante="secondary" onClick={() => salvar("rascunho")} disabled={!podeSalvar || salvando !== null} carregando={salvando === "rascunho"}>
                  {salvando === "rascunho" ? "Salvando..." : "Salvar como Rascunho"}
                </Btn>
                <Btn tamanho="lg" onClick={() => salvar("em_andamento")} disabled={pendencias.length > 0 || salvando !== null} carregando={salvando === "em_andamento"} icone={Rocket}>
                  {salvando === "em_andamento" ? "Publicando..." : "Publicar Evento"}
                </Btn>
              </div>
            </Card>

            {podeSalvar && (
              <TicketCenarios
                custo={totalEstimado}
                rotuloCusto="Custo estimado"
                publicoMinimo={Number(formulario.publico_minimo)}
                publicoMaximo={Number(formulario.publico_maximo)}
                margem={formulario.margem === "" ? 0 : Number(formulario.margem) / 100}
                nota="Prévia com os custos estimados. Depois de fechar as propostas, o ticket é recalculado com os valores acordados."
              />
            )}
          </div>

          <div className="tt-detalhes__lateral">
            <span className="tt-rotulo" style={{ marginBottom: "calc(-1 * var(--esp-3))" }}>
              Prévia em Meus Eventos
            </span>
            <CartaoEvento evento={previa} />
          </div>
        </div>
      )}

      {erro && passo !== 3 && (
        <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginTop: "var(--esp-6)" }}>
          {erro}
        </Aviso>
      )}

      <div className="tt-navegacao-etapas">
        <span title={dicaRascunho}>
          <Btn variante="ghost" onClick={() => salvar("rascunho")} disabled={!podeSalvar || salvando !== null} carregando={salvando === "rascunho"}>
            {salvando === "rascunho" ? "Salvando..." : "Salvar como Rascunho"}
          </Btn>
        </span>
        <div className="tt-navegacao-etapas__direita">
          {passo < 2 && !etapaCompleta[passo] && (
            <span className="tt-pendencia">
              <Icone icone={CircleAlert} tamanho={16} />
              {pendenciaDaEtapa[passo]}
            </span>
          )}
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
