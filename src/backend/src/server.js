import app from "./app.js";
import env from "./config/env.js";
import { testarConexao } from "./config/db.js";

try {
  await testarConexao();
  console.log(`Conectado ao MySQL (${env.db.database}@${env.db.host}:${env.db.port}).`);
} catch (err) {
  console.error(`Não foi possível conectar ao MySQL: ${err.message}`);
  console.error("Confira as variáveis DB_* no arquivo src/backend/.env e se o banco já foi criado (npm run db:criar).");
  process.exit(1);
}

app.listen(env.porta, () => {
  console.log(`API do TrocaTicket rodando em http://localhost:${env.porta}/api`);
  console.log(`CORS liberado para: ${env.frontUrls.join(", ")}`);
});
