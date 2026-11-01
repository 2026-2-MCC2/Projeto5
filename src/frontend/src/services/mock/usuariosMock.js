// DADOS MOCKADOS (localStorage) — lista de usuários usada só pelo Dashboard do admin,
// que ainda não tem rota na API. Login, cadastro e aprovações já usam a API (services/authService.js).
const USERS_KEY = "users";

export function listarUsuarios() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
