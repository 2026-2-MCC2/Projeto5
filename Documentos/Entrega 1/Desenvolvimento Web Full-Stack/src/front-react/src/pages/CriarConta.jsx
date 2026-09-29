import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrar } from "../services/authService";

export default function CriarConta() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState("organizador");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6)
      return setErro("A senha precisa ter no mínimo 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não coincidem.");
    if (!aceito) return setErro("Aceite os Termos de Uso para continuar.");

    try {
      registrar({ nome, email, senha, perfil });
      alert("Conta criada! Aguarde a aprovação do administrador para entrar.");
      navigate("/login");
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <main>
      <Link to="/login">Entrar</Link>
      <h1>Crie sua conta</h1>

      <div>
        {["organizador", "fornecedor", "admin"].map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPerfil(p)}
            style={{ fontWeight: perfil === p ? "bold" : "normal" }}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Repita sua senha"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
          />
          Ao criar sua conta, você concorda com nossos Termos de Uso e Política
          de Privacidade
        </label>

        {erro && <p style={{ color: "red" }}>{erro}</p>}
        <button type="submit">Criar conta →</button>
      </form>
    </main>
  );
}