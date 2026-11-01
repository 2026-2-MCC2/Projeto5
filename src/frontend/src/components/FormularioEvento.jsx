import { Campo, Card, Icone, Input, Select, TextArea } from "./ui";
import { CATEGORIAS_EVENTO } from "../data/categorias";
import { ROTULO_STATUS_EVENTO } from "../data/statusEvento";

const estiloCampoBranco = { background: "var(--superficie)", padding: "10px 13px", borderRadius: "8px" };
const OPCOES_STATUS = Object.entries(ROTULO_STATUS_EVENTO).map(([valor, rotulo]) => ({ valor, rotulo }));

export function TituloSecao({ children }) {
  return <h3 style={{ fontFamily: "Outfit", fontSize: "1.0625rem", fontWeight: 700, color: "var(--texto)", marginBottom: "1.25rem" }}>{children}</h3>;
}

// Cards "Informações Básicas" e "Categoria do Evento", usados ao criar e ao editar um evento.
// `comStatus` mostra o seletor de status (só na edição; ao criar, o status vem do botão escolhido).
export default function FormularioEvento({ valores, onChange, comStatus = false }) {
  const campo = (nome) => ({ value: valores[nome], onChange: (e) => onChange({ ...valores, [nome]: e.target.value }), style: estiloCampoBranco });

  return (
    <>
      <Card style={{ padding: "1.5rem" }}>
        <TituloSecao>Informações Básicas</TituloSecao>
        <div style={{ display: "grid", gap: "14px" }}>
          <Campo rotulo="Nome do Evento *">
            <Input placeholder="Ex: Festival Gastronômico SP 2025" maxLength={150} {...campo("nome")} />
          </Campo>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <Campo rotulo="Início *">
              <Input type="datetime-local" {...campo("data_inicio")} />
            </Campo>
            <Campo rotulo="Término *">
              <Input type="datetime-local" min={valores.data_inicio || undefined} {...campo("data_fim")} />
            </Campo>
          </div>
          <Campo rotulo="Local do Evento *">
            <Input placeholder="Ex: Parque Ibirapuera, São Paulo" maxLength={200} {...campo("local")} />
          </Campo>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
            <Campo rotulo="Público Mínimo *">
              <Input type="number" min="1" step="1" placeholder="Ex: 300" {...campo("publico_minimo")} />
            </Campo>
            <Campo rotulo="Público Máximo *">
              <Input type="number" min={valores.publico_minimo || 1} step="1" placeholder="Ex: 500" {...campo("publico_maximo")} />
            </Campo>
            <Campo rotulo="Margem de Lucro (%)">
              <Input type="number" min="0" max="99" step="1" placeholder="Ex: 25" {...campo("margem")} />
            </Campo>
          </div>
          {comStatus && (
            <Campo rotulo="Status">
              <Select opcoes={OPCOES_STATUS} {...campo("status")} />
            </Campo>
          )}
          <Campo rotulo="Descrição">
            <TextArea rows={3} placeholder="Conte um pouco sobre o evento (opcional)" {...campo("descricao")} />
          </Campo>
        </div>
      </Card>

      <Card style={{ padding: "1.5rem" }}>
        <TituloSecao>Categoria do Evento *</TituloSecao>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
          {CATEGORIAS_EVENTO.map((c) => {
            const ativa = valores.categoria === c.rotulo;
            return (
              <button
                key={c.rotulo}
                type="button"
                aria-pressed={ativa}
                onClick={() => onChange({ ...valores, categoria: c.rotulo })}
                style={{ padding: "16px 10px", borderRadius: "10px", textAlign: "center", background: ativa ? "var(--ativo-fundo)" : "var(--superficie-2)", border: `2px solid ${ativa ? "#2563EB" : "var(--borda)"}`, color: ativa ? "var(--ativo-texto)" : "var(--texto-suave)", cursor: "pointer", transition: "all 0.15s" }}
              >
                <Icone icone={c.icone} tamanho={24} style={{ marginBottom: "6px" }} />
                <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{c.rotulo}</div>
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
}
