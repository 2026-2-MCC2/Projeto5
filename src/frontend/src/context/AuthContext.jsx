import { useEffect, useState } from "react";
import { conferirSessao, entrar, sair, usuarioLogado } from "../services/authService";
import { EVENTO_SESSAO_EXPIRADA } from "../services/api";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(usuarioLogado());

  useEffect(() => {
    // Token expirado ou inválido em qualquer requisição: desloga (o ProtectedRoute leva ao login).
    const aoExpirar = () => {
      sair();
      setUser(null);
    };
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);

    // Ao abrir o app já logado, confere na API se o token ainda vale.
    // Se a API estiver fora do ar, mantém a sessão salva; as telas mostram o erro.
    if (usuarioLogado()) conferirSessao().then(setUser).catch(() => {});

    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, []);

  async function login(email, senha) {
    const usuario = await entrar(email, senha);
    setUser(usuario);
    return usuario;
  }

  function logout() {
    sair();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
