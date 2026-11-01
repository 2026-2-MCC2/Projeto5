import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import NaoEncontrado from "../NaoEncontrado";
import { Aviso, Btn, Card, Esqueleto, ErroCarregar, TituloPagina } from "../../components/ui";
import FormularioEvento from "../../components/FormularioEvento";
import { eventoDoFormulario, formularioDoEvento, problemasDoFormulario } from "../../utils/formularioEvento";
import { atualizarEvento, buscarEvento } from "../../services/organizadorService";

// Edita as informações básicas do evento. Os itens de custo são editados na tela de detalhes.
export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [naoExiste, setNaoExiste] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    buscarEvento(id)
      .then((ev) => ativo && setFormulario(formularioDoEvento(ev)))
      .catch((err) => {
        if (!ativo) return;
        if (err.status === 404 || err.status === 400) setNaoExiste(true);
        else setErroCarregar(err.message);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id, tentativa]);

  const voltar = () => navigate(`/organizador/eventos/${id}`);

  if (naoExiste) return <NaoEncontrado dentroDoLayout titulo="Evento não encontrado" texto="Este evento não existe ou foi excluído." voltarPara="/organizador" rotuloVoltar="Ver meus eventos" />;
  if (carregando)
    return (
      <div role="status" aria-label="Carregando evento">
        <Esqueleto largura="min(320px, 70%)" altura="32px" style={{ marginBottom: "var(--esp-8)" }} />
        <Card style={{ padding: "var(--espaco-cartao)", display: "grid", gap: "var(--esp-5)" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "grid", gap: "var(--esp-2)" }}>
              <Esqueleto largura="30%" />
              <Esqueleto altura="40px" raio="var(--raio-md)" />
            </div>
          ))}
        </Card>
      </div>
    );
  if (erroCarregar)
    return (
      <ErroCarregar
        titulo="Não foi possível carregar o evento"
        mensagem={erroCarregar}
        onTentar={() => {
          setCarregando(true);
          setErroCarregar("");
          setTentativa((n) => n + 1);
        }}
      />
    );

  const problemas = problemasDoFormulario(formulario);
  const faltaCategoria = formulario.status !== "rascunho" && !formulario.categoria;

  async function salvar() {
    setErro("");
    if (problemas.length || faltaCategoria) {
      setErro(problemas[0] ?? "Escolha a categoria do evento.");
      return;
    }
    setSalvando(true);
    try {
      await atualizarEvento(id, eventoDoFormulario(formulario));
      navigate(`/organizador/eventos/${id}`, { state: { sucesso: "Alterações salvas com sucesso." } });
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  return (
    <>
      <TituloPagina titulo="Editar Evento" sub={formulario.nome || "Altere as informações do evento"}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn variante="secondary" icone={X} onClick={voltar} disabled={salvando}>
            Cancelar
          </Btn>
          <Btn icone={Check} onClick={salvar} carregando={salvando}>
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </Btn>
        </div>
      </TituloPagina>

      {erro && (
        <Aviso variante="erro" onFechar={() => setErro("")} style={{ marginBottom: "var(--esp-5)" }}>
          {erro}
        </Aviso>
      )}

      <div style={{ display: "grid", gap: "var(--esp-6)" }}>
        <FormularioEvento valores={formulario} onChange={setFormulario} comStatus />
      </div>
    </>
  );
}
