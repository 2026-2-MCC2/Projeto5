import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Plus, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Aviso, Card, Badge, Btn, Carregando, Chip, CampoBusca, StatusBadge, TextoComIcone, TituloPagina, Valor, Vazio } from "../../components/ui";
import { listarEventos } from "../../services/organizadorService";
import { ROTULO_STATUS_EVENTO } from "../../data/statusEvento";
import { dataCurta, moeda } from "../../utils/formatar";

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

  return (
    <>
      <TituloPagina titulo="Meus Eventos" sub={carregando ? "Carregando..." : `${eventos.length} eventos cadastrados`}>
        <Btn onClick={() => navigate("/organizador/eventos/novo")} icone={Plus}>
          Criar Evento
        </Btn>
      </TituloPagina>

      {sucesso && (
        <Aviso variante="sucesso" onFechar={() => setSucesso("")} style={{ marginBottom: "1.25rem" }}>
          {sucesso}
        </Aviso>
      )}

      <Card style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <CampoBusca placeholder="Buscar por nome ou local..." valor={busca} onChange={setBusca} />
          <div style={{ display: "flex", gap: "4px" }}>
            {abas.map((a) => (
              <Chip key={a.rotulo} rotulo={`${a.rotulo} (${eventos.filter(a.filtro).length})`} ativo={aba === a} onClick={() => setAba(a)} redondo={false} />
            ))}
          </div>
        </div>
      </Card>

      {carregando ? (
        <Carregando texto="Carregando seus eventos..." />
      ) : erro ? (
        <Aviso variante="erro">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <span>{erro}</span>
            <Btn variante="danger" tamanho="sm" icone={RefreshCw} onClick={() => { setCarregando(true); setErro(""); setTentativa((n) => n + 1); }}>
              Tentar de novo
            </Btn>
          </div>
        </Aviso>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {filtrados.map((ev) => (
            <Card key={ev.id} style={{ padding: "1.125rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <h3 style={{ fontFamily: "Outfit", fontSize: "1rem", fontWeight: 700, color: "var(--texto)" }}>{ev.nome}</h3>
                    <StatusBadge status={ROTULO_STATUS_EVENTO[ev.status]} />
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "0.8125rem", color: "var(--texto-fraco)", flexWrap: "wrap" }}>
                    <TextoComIcone icone={Calendar}>{dataCurta(ev.data_inicio)}</TextoComIcone>
                    <TextoComIcone icone={MapPin}>{ev.local}</TextoComIcone>
                    <Valor cor="var(--texto-suave)" tamanho="0.8125rem" peso={400}>
                      {moeda(ev.orcamento)}
                    </Valor>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 700, color: "#2563EB" }}>{ev.total_propostas}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--texto-fraco)", marginTop: "1px" }}>propostas</div>
                  </div>
                  {ev.categoria && <Badge>{ev.categoria}</Badge>}
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <Btn variante="secondary" tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}`)}>
                    Detalhes
                  </Btn>
                  {ev.status === "em_andamento" && ev.total_propostas > 0 && (
                    <Btn tamanho="sm" onClick={() => navigate(`/organizador/eventos/${ev.id}/propostas`)}>
                      Propostas
                    </Btn>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filtrados.length === 0 && (
            <Vazio icone={Search} texto={eventos.length === 0 ? "Você ainda não criou nenhum evento." : "Nenhum evento encontrado"} />
          )}
        </div>
      )}
    </>
  );
}
