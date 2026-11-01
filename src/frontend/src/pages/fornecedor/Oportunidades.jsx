import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";
import { Btn, Chip, CampoBusca, TituloPagina, Vazio } from "../../components/ui";
import { CartaoOportunidade } from "../../components/fornecedor";
import { listarEventos } from "../../services/fornecedorService";
import { CATEGORIAS_FORNECEDOR } from "../../data/categorias";

const TODAS = "Todas as Ofertas";
const filtros = [TODAS, ...CATEGORIAS_FORNECEDOR];

export default function Oportunidades() {
  const navigate = useNavigate();
  const eventos = listarEventos();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState(TODAS);

  const termo = busca.toLowerCase();
  const filtrados = eventos.filter((e) => {
    const casaBusca = !termo || e.nome.toLowerCase().includes(termo) || e.categoria.toLowerCase().includes(termo);
    const casaFiltro = filtro === TODAS || e.necessidades.includes(filtro);
    return casaBusca && casaFiltro;
  });

  function limparFiltros() {
    setBusca("");
    setFiltro(TODAS);
  }

  return (
    <>
      <TituloPagina titulo="Eventos Disponíveis para Cotação" sub={`${eventos.length} oportunidades abertas para sua categoria`} />

      <div className="tt-filtros">
        <CampoBusca placeholder="Buscar por nome, categoria..." valor={busca} onChange={setBusca} />
      </div>
      <div style={{ display: "flex", gap: "var(--esp-2)", flexWrap: "wrap", margin: "calc(-1 * var(--esp-3)) 0 var(--esp-6)" }} role="group" aria-label="Filtrar pelo que o evento procura">
        {filtros.map((f) => (
          <Chip key={f} rotulo={f} ativo={filtro === f} onClick={() => setFiltro(f)} />
        ))}
      </div>

      {eventos.length === 0 ? (
        <Vazio icone={SearchX} titulo="Nenhuma oportunidade aberta agora" texto="Quando um organizador publicar um evento que precise do seu serviço, ele aparece aqui." />
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
              acao={
                <Btn tamanho="sm" iconeDepois={ArrowRight} onClick={() => navigate(`/fornecedor/eventos/${ev.id}`)}>
                  Ver detalhes e cotar
                </Btn>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
