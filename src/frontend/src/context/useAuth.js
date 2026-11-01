import { createContext, useContext } from "react";

// Contexto da sessão (usuário logado, login e logout). O AuthProvider fica em AuthContext.jsx;
// o hook mora aqui para aquele arquivo exportar só componentes (exigência do Fast Refresh do Vite).
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
