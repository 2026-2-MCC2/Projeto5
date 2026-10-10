import { useAuth } from "../context/AuthContext";

export default function Fornecedor() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Área do Fornecedor</h1>
      <p>
        Olá, {user.nome} <button onClick={logout}>Sair</button>
      </p>
    </main>
  );
}