// Peças de painel gerencial (dashboard do admin, propostas e reputação do fornecedor).
// Regras de gráfico: marcas finas, uma cor para magnitude (azul), cores de status só com ícone + rótulo,
// texto sempre nas cores de texto (nunca na cor da barra), dica no mouse/teclado e uma tabela para leitores de tela.
import { Card, Icone } from "./ui";
import "./painel.css";

// Indicador (stat tile): rótulo, valor e detalhe. `medidor` (0 a 1) desenha uma barra de proporção.
// `acao` (opcional) aparece no rodapé, ex.: link para a tela da pendência.
export function Kpi({ icone, rotulo, valor, detalhe, medidor, acao, destaque = false }) {
  return (
    <Card style={{ padding: 0 }}>
      <div className={`tt-kpi${destaque ? " tt-kpi--destaque" : ""}`}>
        <div className="tt-kpi__topo">
          <span className="tt-kpi__rotulo">{rotulo}</span>
          {icone && (
            <span className="tt-kpi__icone">
              <Icone icone={icone} tamanho={16} />
            </span>
          )}
        </div>
        <strong className="tt-kpi__valor">{valor}</strong>
        {medidor !== undefined && (
          <div className="tt-kpi__medidor" role="img" aria-label={`${Math.round(medidor * 100)}%`}>
            <span style={{ width: `${Math.max(0, Math.min(1, medidor)) * 100}%` }} />
          </div>
        )}
        {detalhe && <span className="tt-kpi__detalhe">{detalhe}</span>}
        {acao && <div className="tt-kpi__acao">{acao}</div>}
      </div>
    </Card>
  );
}

// Moldura de um gráfico: título, subtítulo e conteúdo.
export function CartaoGrafico({ titulo, sub, children, extra }) {
  return (
    <Card style={{ padding: 0 }}>
      <section className="tt-grafico" aria-label={titulo}>
        <header className="tt-grafico__cabeca">
          <div>
            <h3>{titulo}</h3>
            {sub && <p>{sub}</p>}
          </div>
          {extra}
        </header>
        {children}
      </section>
    </Card>
  );
}

// Tabela só para leitores de tela, com os mesmos números do gráfico.
function TabelaOculta({ titulo, dados, rotuloValor }) {
  return (
    <table className="tt-sr">
      <caption>{titulo}</caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">{rotuloValor}</th>
        </tr>
      </thead>
      <tbody>
        {dados.map((d) => (
          <tr key={d.rotulo}>
            <th scope="row">{d.rotuloLongo ?? d.rotulo}</th>
            <td>{d.formatado ?? d.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Barras horizontais. `dados`: { rotulo, valor, formatado?, icone?, variante? }.
// `variante` (info/warning/success/error/neutral) só para estados (status); sem ela, a barra é azul.
// `maximo` fixa a escala (ex.: notas de 0 a 5); sem ele, a maior barra ocupa a largura toda.
export function GraficoBarras({ titulo, dados, rotuloValor = "Valor", maximo }) {
  const topo = maximo ?? Math.max(...dados.map((d) => d.valor), 0);
  return (
    <>
      <ul className="tt-barras" aria-hidden="true">
        {dados.map((d) => {
          const fracao = topo > 0 ? d.valor / topo : 0;
          return (
            <li key={d.rotulo} className={`tt-barras__linha${d.variante ? ` tt-barras__linha--${d.variante}` : ""}`} tabIndex={0}>
              <span className="tt-barras__rotulo">
                {d.icone && <Icone icone={d.icone} tamanho={14} className="tt-barras__icone" />}
                {d.rotulo}
              </span>
              <span className="tt-barras__trilho">
                {/* valor zero não desenha barra (um traço sugeriria um valor que não existe) */}
                <span className="tt-barras__barra" style={{ width: d.valor > 0 ? `max(2px, ${fracao * 100}%)` : 0 }} />
                <span className="tt-barras__dica" role="tooltip">
                  <strong>{d.rotulo}</strong>
                  {d.formatado ?? d.valor}
                </span>
              </span>
              <span className="tt-barras__valor">{d.formatado ?? d.valor}</span>
            </li>
          );
        })}
      </ul>
      <TabelaOculta titulo={titulo} dados={dados} rotuloValor={rotuloValor} />
    </>
  );
}

// Escala "redonda" para o eixo: 0, 2, 4, 6... ou 0, 5, 10... Contagens nunca têm marca quebrada (0,5).
function escala(maximo) {
  if (maximo <= 0) return { topo: 1, marcas: [0, 1] };
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = Math.max(1, [1, 2, 5, 10].map((m) => m * potencia).find((p) => p >= bruto));
  const topo = Math.ceil(maximo / passo) * passo;
  const marcas = [];
  for (let v = 0; v <= topo; v += passo) marcas.push(v);
  return { topo, marcas };
}

// Colunas verticais (contagens ao longo do tempo). `dados`: { rotulo, valor }.
// Só a maior coluna leva o número em cima; as outras mostram na dica e na tabela.
export function GraficoColunas({ titulo, dados, rotuloValor = "Quantidade" }) {
  const maior = Math.max(...dados.map((d) => d.valor), 0);
  const { topo, marcas } = escala(maior);
  // Rótulo de valor só na coluna mais recente entre as que empatam no máximo.
  const indiceRotulo = dados.map((d) => d.valor).lastIndexOf(maior);
  return (
    <>
      <div className="tt-colunas" aria-hidden="true">
        <div className="tt-colunas__eixo">
          {[...marcas].reverse().map((m) => (
            <span key={m}>{m.toLocaleString("pt-BR")}</span>
          ))}
        </div>
        <div className="tt-colunas__area">
          <div className="tt-colunas__grade">
            {marcas.map((m) => (
              <span key={m} style={{ bottom: `${(m / topo) * 100}%` }} />
            ))}
          </div>
          <div className="tt-colunas__barras">
            {dados.map((d, i) => (
              <div key={d.rotulo} className="tt-colunas__coluna" tabIndex={0}>
                <div className="tt-colunas__trilho">
                  <span className="tt-colunas__barra" style={{ height: `${(d.valor / topo) * 100}%` }}>
                    {i === indiceRotulo && maior > 0 && <span className="tt-colunas__valor">{d.valor}</span>}
                  </span>
                  <span className="tt-colunas__dica" role="tooltip">
                    <strong>{d.rotuloLongo ?? d.rotulo}</strong>
                    {d.valor} {d.valor === 1 ? "evento" : "eventos"}
                  </span>
                </div>
                <span className="tt-colunas__rotulo">{d.rotulo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabelaOculta titulo={titulo} dados={dados} rotuloValor={rotuloValor} />
    </>
  );
}
