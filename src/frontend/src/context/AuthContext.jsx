import { createContext, useContext, useState } from "react";
import { entrar, sair, usuarioLogado } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(usuarioLogado());

  function login(email, senha) {
    const usuario = entrar(email, senha);
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

export const useAuth = () => useContext(AuthContext);