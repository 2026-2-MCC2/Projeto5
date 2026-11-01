import { Campo, Card, Icone, Input, Select, TextArea } from "./ui";
import { CATEGORIAS_EVENTO } from "../data/categorias";
import { ROTULO_STATUS_EVENTO } from "../data/statusEvento";
import "./organizador.css";

const OPCOES_STATUS = Object.entries(ROTULO_STATUS_EVENTO).map(([valor, rotulo]) => ({ valor, rotulo }));

export function TituloSecao({ children }) {
  return <h3 style={{ fontSize: "var(--tam-lg)", fontWeight: 700, color: "var(--texto)", marginBottom: "var(--esp-5)" }}>{children}</h3>;
}

// Uma seção do formulário: título e explicação à esquerda, campos à direita (empilha no celular).
function Secao({ titulo, texto, children }) {
  return (
    <section className="tt-secao-form">
      <div className="tt-secao-form__cabeca">
        <h3>{titulo}</h3>
        <p>{texto}</p>
      </div>
      <div className="tt-secao-form__campos">{children}</div>
    </section>
  );
}

// Informações do evento, usadas ao criar e ao editar.
// `comStatus` mostra o seletor de status (só na edição; ao criar, o status vem do botão escolhido).
export default function FormularioEvento({ valores, onChange, comStatus = false }) {
  const campo = (nome) => ({ value: valores[nome], onChange: (e) => onChange({ ...valores, [nome]: e.target.value }) });

  return (
    <Card style={{ padding: "var(--esp-8)" }}>
      <Secao titulo="Sobre o evento" texto="Como o evento vai aparecer para os fornecedores.">
        <Campo rotulo="Nome do evento *">
          <Input placeholder="Ex: Festival Gastronômico SP 2026" maxLength={150} {...campo("nome")} />
        </Campo>

        <div>
          <span className="tt-rotulo-campo" id="rotulo-categoria">
            Categoria * <span style={{ fontWeight: 400, color: "var(--texto-suave)" }}>(obrigatória para publicar)</span>
          </span>
          <div className="tt-categorias" role="group" aria-labelledby="rotulo-categoria">
            {CATEGORIAS_EVENTO.map((c) => (
              <button key={c.rotulo} type="button" className="tt-categoria" aria-pressed={valores.categoria === c.rotulo} onClick={() => onChange({ ...valores, categoria: c.rotulo })}>
                <Icone icone={c.icone} tamanho={22} />
                {c.rotulo}
              </button>
            ))}
          </div>
        </div>

        {comStatus && (
          <Campo rotulo="Status">
            <Select opcoes={OPCOES_STATUS} {...campo("status")} />
          </Campo>
        )}

        <Campo rotulo="Descrição">
          <TextArea rows={3} placeholder="Conte um pouco sobre o evento (opcional)" {...campo("descricao")} />
        </Campo>
      </Secao>

      <Secao titulo="Quando e onde" texto="Data, horário e local de realização.">
        <div className="tt-campos-linha">
          <Campo rotulo="Início *">
            <Input type="datetime-local" {...campo("data_inicio")} />
          </Campo>
          <Campo rotulo="Término *">
            <Input type="datetime-local" min={valores.data_inicio || undefined} {...campo("data_fim")} />
          </Campo>
        </div>
        <Campo rotulo="Local do evento *">
          <Input placeholder="Ex: Parque Ibirapuera, São Paulo" maxLength={200} {...campo("local")} />
        </Campo>
      </Secao>

      <Secao titulo="Público e margem" texto="Usados para estimar o preço do ingresso nos cenários de público mínimo e máximo.">
        <div className="tt-campos-linha">
          <Campo rotulo="Público mínimo *">
            <Input type="number" min="1" step="1" placeholder="Ex: 300" {...campo("publico_minimo")} />
          </Campo>
          <Campo rotulo="Público máximo *">
            <Input type="number" min={valores.publico_minimo || 1} step="1" placeholder="Ex: 500" {...campo("publico_maximo")} />
          </Campo>
          <Campo rotulo="Margem de lucro (%)">
            <Input type="number" min="0" max="99" step="1" placeholder="Ex: 25" {...campo("margem")} />
            <span className="tt-dica-campo">Parte do preço do ingresso que fica como lucro (0 a 99%).</span>
          </Campo>
        </div>
      </Secao>
    </Card>
  );
}
