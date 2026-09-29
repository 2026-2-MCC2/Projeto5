const USERS_KEY = "users";
const SESSION_KEY = "user";

// Lê os usuários salvos. Na primeira vez, já cria um admin para você conseguir entrar.
function lerUsuarios() {
  const salvos = JSON.parse(localStorage.getItem(USERS_KEY) || "null");
  if (salvos) return salvos;

  const inicial = [
    {
      id: 1,
      nome: "Administrador",
      email: "admin@trocaticket.com",
      senha: "admin123",
      perfil: "admin",
      aprovado: true,
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(inicial));
  return inicial;
}

function salvarUsuarios(lista) {
  localStorage.setItem(USERS_KEY, JSON.stringify(lista));
}

export function registrar({ nome, email, senha, perfil }) {
  const usuarios = lerUsuarios();

  if (usuarios.some((u) => u.email === email)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const novo = { id: Date.now(), nome, email, senha, perfil, aprovado: false };
  salvarUsuarios([...usuarios, novo]);
}

export function entrar(email, senha) {
  const usuario = lerUsuarios().find(
    (u) => u.email === email && u.senha === senha
  );

  if (!usuario) throw new Error("E-mail ou senha inválidos.");
  if (!usuario.aprovado) {
    throw new Error("Sua conta ainda não foi aprovada pelo administrador.");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
  return usuario;
}

export function sair() {
  localStorage.removeItem(SESSION_KEY);
}

export function usuarioLogado() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function listarPendentes() {
  return lerUsuarios().filter((u) => !u.aprovado);
}

export function aprovarUsuario(id) {
  const atualizados = lerUsuarios().map((u) =>
    u.id === id ? { ...u, aprovado: true } : u
  );
  salvarUsuarios(atualizados);
}