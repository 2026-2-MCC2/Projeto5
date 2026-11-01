import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, Plus, SearchX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Aviso, Btn, Chip, CampoBusca, ErroCarregar, TituloPagina, Vazio } from "../../components/ui";
import { CartaoEvento, EsqueletoCartaoEvento } from "../../components/organizador";
import { listarEventos } from "../../services/organizadorService";

const abas = [
  { rotulo: "Todos", filtro: () => true },
  { rotulo: "Em andamento", filtro: (e) => e.status === "em_andamento" },
  { rotulo: "Concluídos", filtro: (e) => e.status === "concluido" },
];

export default function MeusEventos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? "");
  const [tentativa, setTentativa] = useState(0);
  const [aba, setAba] = useState(abas[0]);
  const [busca, setBusca] = useState("");

  // A mensagem de sucesso (ex.: "Evento excluído") vem da tela anterior; limpa para não voltar ao recarregar.
  useEffect(() => {
    if (location.state?.sucesso) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    let ativo = true;
    listarEventos(user.id)
      .then((lista) => ativo && setEventos(lista))
      .catch((err) => ativo && setErro(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [user.id, tentativa]);

  const termo = busca.toLowerCase();
  const filtrados = eventos.filter(
    (e) => aba.filtro(e) && (!termo || e.nome.toLowerCase().includes(termo) || e.local.toLowerCase().includes(termo))
  );

  const criar = () => navigate("/organizador/eventos/novo");

  function limparFiltros() {
    setBusca("");
    setAba(abas[0]);
  }

  return (
    <>
      <TituloPagina
        titulo="Meus Eventos"
        sub={carregando ? "Carregando seus eventos..." : erro ? undefined : `${eventos.length} ${eventos.length === 1 ? "evento cadastrado" : "eventos cadastrados"}`}
      >
        <Btn onClick={criar} icone={Plus}>
          Criar Evento
        </Btn>
      </TituloPagina>

      {sucesso && (
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "var(--esp-5)" }}>
          {sucesso}
        </Aviso>
      )}

      {!erro && (carregando || eventos.length > 0) && (
        <div className="tt-filtros">
          <CampoBusca placeholder="Buscar por nome ou local..." valor={busca} onChange={setBusca} />
          <div className="tt-filtros__abas" role="group" aria-label="Filtrar por status">
            {abas.map((a) => (
              <Chip key={a.rotulo} rotulo={`${a.rotulo} (${eventos.filter(a.filtro).length})`} ativo={aba === a} onClick={() => setAba(a)} redondo={false} />
            ))}
          </div>
        </div>
      )}

      {carregando ? (
        <div className="tt-grade-eventos" role="status" aria-label="Carregando eventos">
          {Array.from({ length: 6 }, (_, i) => (
            <EsqueletoCartaoEvento key={i} />
          ))}
        </div>
      ) : erro ? (
        <ErroCarregar
          titulo="Não foi possível carregar seus eventos"
          mensagem={erro}
          onTentar={() => {
            setCarregando(true);
            setErro("");
            setTentativa((n) => n + 1);
          }}
        />
      ) : eventos.length === 0 ? (
        <Vazio icone={CalendarPlus} titulo="Você ainda não tem eventos" texto="Crie seu primeiro evento, liste o que precisa contratar e comece a receber propostas de fornecedores.">
          <Btn tamanho="lg" icone={Plus} onClick={criar}>
            Criar primeiro evento
          </Btn>
        </Vazio>
      ) : filtrados.length === 0 ? (
        <Vazio icone={SearchX} titulo="Nenhum evento encontrado" texto="Nenhum evento combina com a busca e o filtro escolhidos.">
          <Btn variante="secondary" onClick={limparFiltros}>
            Limpar busca e filtros
          </Btn>
        </Vazio>
      ) : (
        <div className="tt-grade-eventos">
          {filtrados.map((ev) => (
            <CartaoEvento
              key={ev.id}
              evento={ev}
              onAbrir={() => navigate(`/organizador/eventos/${ev.id}`)}
              acoes={
                <>
                  <Btn variante="secondary" tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}`)}>
                    Detalhes
                  </Btn>
                  {ev.status === "em_andamento" && ev.total_propostas > 0 && (
                    <Btn tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}/propostas`)}>
                      Propostas
                    </Btn>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
