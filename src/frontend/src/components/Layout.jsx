import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, LogOut, Menu, X } from "lucide-react";
import { Contador, Icone, MarcaLogo } from "./ui";
import BotaoTema from "./BotaoTema";
import { ROTULO_PERFIL } from "../data/perfis";
import "./Layout.css";

// Iniciais do nome para o avatar: "Ana Paula Souza" -> "AS"
function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// Estrutura das áreas logadas: menu lateral + barra do topo + a página da rota atual.
// `nav` é uma lista de { rotulo, para, end, contador, icone }. O primeiro item é a página inicial da área.
// `contexto` fica disponível para as páginas via useOutletContext().
// No celular (até 1023px) o menu lateral vira uma gaveta, aberta pelo botão de menu da barra do topo.
export default function Layout({ nav, contexto }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenuRef = useRef(null);
  const botaoFecharRef = useRef(null);

  // Com a gaveta aberta: foco no botão de fechar, Esc fecha e a página de trás não rola.
  // Ao fechar, o foco volta para o botão que abriu.
  useEffect(() => {
    if (!menuAberto) return;
    const botaoMenu = botaoMenuRef.current;
    botaoFecharRef.current?.focus();
    document.body.classList.add("tt-sem-rolagem");
    const aoTeclar = (e) => e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.classList.remove("tt-sem-rolagem");
      window.removeEventListener("keydown", aoTeclar);
      botaoMenu?.focus();
    };
  }, [menuAberto]);

  const fecharMenu = () => setMenuAberto(false);

  function sairDaConta() {
    logout();
    navigate("/");
  }

  return (
    <div className="area-logada tt-app">
      <a href="#conteudo" className="tt-pular">
        Pular para o conteúdo
      </a>

      <div className={`tt-app__fundo${menuAberto ? " tt-app__fundo--visivel" : ""}`} onClick={fecharMenu} aria-hidden="true" />

      <aside id="menu-lateral" className={`tt-lateral${menuAberto ? " tt-lateral--aberta" : ""}`} aria-label="Menu principal">
        <div className="tt-lateral__topo">
          <button
            type="button"
            className="tt-marca"
            onClick={() => {
              fecharMenu();
              navigate(nav[0].para);
            }}
          >
            <MarcaLogo tamanho={32} />
            <span className="tt-marca__textos">
              <span className="tt-marca__nome">TrocaTicket</span>
              <span className="tt-marca__area">{ROTULO_PERFIL[user.perfil]}</span>
            </span>
          </button>
          <button type="button" ref={botaoFecharRef} className="tt-lateral__fechar" onClick={fecharMenu} aria-label="Fechar menu">
            <Icone icone={X} tamanho={20} />
          </button>
        </div>

        <nav className="tt-lateral__nav">
          <ul>
            {nav.map((item) => (
              <li key={item.para}>
                <NavLink to={item.para} end={item.end} className="tt-nav-link" onClick={fecharMenu}>
                  {item.icone && <Icone icone={item.icone} tamanho={18} />}
                  <span className="tt-nav-link__rotulo">{item.rotulo}</span>
                  {item.contador > 0 && <Contador valor={item.contador} />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="tt-lateral__rodape">
          <BotaoTema variante="menu" />

          <div className="tt-usuario">
            <span className="tt-avatar" aria-hidden="true">
              {iniciais(user.nome)}
            </span>
            <span className="tt-usuario__textos">
              <span className="tt-usuario__nome" title={user.nome}>
                {user.nome}
              </span>
              <span className="tt-usuario__email" title={user.email}>
                {user.email}
              </span>
            </span>
            <button type="button" className="tt-usuario__sair" onClick={sairDaConta} aria-label="Sair da conta" title="Sair da conta">
              <Icone icone={LogOut} tamanho={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="tt-app__coluna">
        <header className="tt-topo">
          <button
            type="button"
            ref={botaoMenuRef}
            className="tt-topo__menu"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            aria-controls="menu-lateral"
          >
            <Icone icone={Menu} tamanho={20} />
          </button>

          <span className="tt-topo__marca">
            <MarcaLogo tamanho={26} />
            TrocaTicket
          </span>

          <button type="button" className="tt-topo__voltar" onClick={() => navigate(-1)}>
            <Icone icone={ChevronLeft} tamanho={16} />
            Voltar
          </button>
        </header>

        <main id="conteudo" className="tt-conteudo" tabIndex={-1}>
          <Outlet context={contexto} />
        </main>
      </div>
    </div>
  );
}
