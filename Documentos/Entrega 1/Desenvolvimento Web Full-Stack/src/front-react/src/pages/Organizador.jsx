import { useAuth } from "../context/AuthContext";

export default function Organizador() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Área do Organizador</h1>
      <p>
        Olá, {user.nome} <button onClick={logout}>Sair</button>
      </p>
    </main>
  );
}