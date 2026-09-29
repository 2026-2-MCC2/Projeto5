import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    try {
      const usuario = login(email, senha);
      navigate(`/${usuario.perfil}`);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <main>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit}>
        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button type="submit">Entrar →</button>
      </form>
      <p>
        Não tem conta? <Link to="/criar-conta">Criar conta</Link>
      </p>
    </main>
  );
}