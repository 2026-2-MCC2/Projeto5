import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, House } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { Btn, MarcaLogo, Picote } from "../components/ui";
import "./NaoEncontrado.css";

// Tela de erro 404, em forma de ingresso inválido (canhoto carimbado).
// - Sozinha (rota que não existe): ocupa a tela toda, com a barra do logo como no Login.
// - `dentroDoLayout`: usada nas áreas logadas quando um registro não existe (ex.: evento apagado),
//   aparecendo dentro do Layout, sem repetir o logo.
export default function NaoEncontrado({
  titulo = "Página não encontrada",
  texto = "O endereço que você tentou acessar não existe ou foi removido. Confira se ele foi digitado corretamente.",
  voltarPara,
  rotuloVoltar,
  dentroDoLayout = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Quem está logado volta para o próprio painel; visitante volta para a página inicial.
  const destino = voltarPara ?? (user ? `/${user.perfil}` : "/");
  const rotuloDestino = rotuloVoltar ?? (user ? "Ir para o meu painel" : "Ir para o início");

  // Dentro do Layout já existe um <main>; aqui fica uma <div> para não aninhar dois.
  const Moldura = dentroDoLayout ? "div" : "main";

  const conteudo = (
    <Moldura className={`tt-404${dentroDoLayout ? " tt-404--layout" : ""}`}>
      <article className="tt-404__ingresso">
        <div className="tt-404__topo">
          {/* "404" com o mesmo preenchimento pontilhado do letreiro da Landing; a cor acompanha o tema */}
          <span className="tt-404__numero" aria-hidden="true">
            404
          </span>
          <span className="tt-404__carimbo" aria-hidden="true">
            Não encontrado
          </span>
        </div>

        <Picote />

        <div className="tt-404__corpo">
          <h1>{titulo}</h1>
          <p>{texto}</p>

          <dl className="tt-404__endereco">
            <dt>Endereço acessado</dt>
            <dd>{pathname}</dd>
          </dl>

          <div className="tt-404__acoes">
            <Btn variante="secondary" icone={ArrowLeft} onClick={() => navigate(-1)}>
              Voltar
            </Btn>
            <Btn icone={House} onClick={() => navigate(destino, { replace: true })}>
              {rotuloDestino}
            </Btn>
          </div>
        </div>
      </article>
    </Moldura>
  );

  if (dentroDoLayout) return conteudo;

  return (
    <div className="tt-404-tela">
      {/* Barra superior, igual à do Login */}
      <header className="tt-404-tela__topo">
        <button type="button" className="tt-404-tela__marca" onClick={() => navigate("/")}>
          <MarcaLogo tamanho={28} />
          TrocaTicket
        </button>
      </header>
      {conteudo}
    </div>
  );
}
