import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listarPendentes, aprovarUsuario } from "../services/authService";

export default function Admin() {
  const { user, logout } = useAuth();
  const [pendentes, setPendentes] = useState(listarPendentes());

  function aprovar(id) {
    aprovarUsuario(id);
    setPendentes(listarPendentes());
  }

  return (
    <main>
      <h1>Painel do Admin</h1>
      <p>
        Olá, {user.nome} <button onClick={logout}>Sair</button>
      </p>

      <h2>Contas aguardando aprovação</h2>
      {pendentes.length === 0 && <p>Nenhuma conta pendente.</p>}
      <ul>
        {pendentes.map((u) => (
          <li key={u.id}>
            {u.nome} ({u.email}) - {u.perfil}{" "}
            <button onClick={() => aprovar(u.id)}>Aprovar</button>
          </li>
        ))}
      </ul>
    </main>
  );
}