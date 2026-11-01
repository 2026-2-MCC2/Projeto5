import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Inbox, SearchX } from "lucide-react";
import { Btn, Chip, CampoBusca, ErroCarregar, TituloPagina, Vazio } from "../../components/ui";
import { CartaoOportunidade, EsqueletoOportunidade } from "../../components/fornecedor";
import { listarEventos, listarPropostas } from "../../services/fornecedorService";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";

const TODAS = "Todas as Ofertas";
const filtros = [TODAS, ...CATEGORIAS_FORNECEDOR];

export default function Oportunidades() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [enviadosPorEvento, setEnviadosPorEvento] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState(TODAS);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarEventos(), listarPropostas()])
      .then(([lista, minhas]) => {
        if (!ativo) return;
        setEventos(lista);
        // quantos itens de cada evento já têm proposta minha
        const contagem = {};
        for (const p of minhas) contagem[p.evento_id] = (contagem[p.evento_id] ?? 0) + 1;
        setEnviadosPorEvento(contagem);
      })
      .catch((err) => ativo && setErro(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const termo = busca.toLowerCase();
  const filtrados = eventos.filter((e) => {
    const casaBusca = !termo || [e.nome, e.categoria, e.local].some((v) => v?.toLowerCase().includes(termo));
    const casaFiltro = filtro === TODAS || e.categorias_itens.includes(filtro);
    return casaBusca && casaFiltro;
  });

  function limparFiltros() {
    setBusca("");
    setFiltro(TODAS);
  }

  return (
    <>
      <TituloPagina
        titulo="Eventos Disponíveis para Cotação"
        sub={carregando ? "Carregando oportunidades..." : erro ? undefined : `${eventos.length} ${eventos.length === 1 ? "evento aberto" : "eventos abertos"} para receber propostas`}
      />

      {!erro && (carregando || eventos.length > 0) && (
        <>
          <div className="tt-filtros">
            <CampoBusca placeholder="Buscar por nome, categoria ou local..." valor={busca} onChange={setBusca} />
          </div>
          <div style={{ display: "flex", gap: "var(--esp-2)", flexWrap: "wrap", margin: "calc(-1 * var(--esp-3)) 0 var(--esp-6)" }} role="group" aria-label="Filtrar pelo que o evento precisa contratar">
            {filtros.map((f) => (
              <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
            ))}
          </div>
        </>
      )}

      {carregando ? (
        <div className="tt-grade-eventos" role="status" aria-label="Carregando oportunidades">
          {Array.from({ length: 6 }, (_, i) => (
            <EsqueletoOportunidade key={i} />
          ))}
        </div>
      ) : erro ? (
        <ErroCarregar
          titulo="Não foi possível carregar as oportunidades"
          mensagem={erro}
          onTentar={() => {
            setCarregando(true);
            setErro("");
            setTentativa((n) => n + 1);
          }}
        />
      ) : eventos.length === 0 ? (
        <Vazio icone={Inbox} titulo="Nenhuma oportunidade aberta agora" texto="Quando um organizador publicar um evento, ele aparece aqui para você enviar sua proposta." />
      ) : filtrados.length === 0 ? (
        <Vazio icone={SearchX} titulo="Nenhum evento encontrado" texto="Nenhum evento combina com a busca e o filtro escolhidos.">
          <Btn variante="secondary" onClick={limparFiltros}>
            Limpar busca e filtros
          </Btn>
        </Vazio>
      ) : (
        <div className="tt-grade-eventos">
          {filtrados.map((ev) => (
            <CartaoOportunidade
              key={ev.id}
              evento={ev}
              destaque={filtro !== TODAS ? filtro : undefined}
              itensEnviados={enviadosPorEvento[ev.id] ?? 0}
              acao={
                <Btn tamanho="sm" variante={enviadosPorEvento[ev.id] ? "secondary" : "primary"} iconeDepois={ArrowRight} onClick={() => navigate(`/fornecedor/eventos/${ev.id}`)}>
                  {enviadosPorEvento[ev.id] ? "Ver evento" : "Ver detalhes e cotar"}
                </Btn>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
