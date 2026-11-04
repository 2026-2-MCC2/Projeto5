// Aplica uma migração em um banco que já existe, com os dados do .env, sem apagar nada.
//   npm run db:migrar -- 002_redefinicoes_senha.sql
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import env from "../src/config/env.js";

const arquivo = process.argv[2];

// Só o nome do arquivo: nada de caminhos para fora da pasta migracoes.
if (!/^[\w-]+\.sql$/.test(arquivo ?? "")) {
  console.error("Informe o arquivo da migração. Exemplo: npm run db:migrar -- 002_redefinicoes_senha.sql");
  process.exit(1);
}

let conexao;
try {
  const sql = await readFile(new URL(`./migracoes/${arquivo}`, import.meta.url), "utf8");
  conexao = await mysql.createConnection({ ...env.db, multipleStatements: true });
  await conexao.query(sql);
  console.log(`Migração ${arquivo} aplicada no banco "${env.db.database}".`);
} catch (err) {
  console.error(`Erro ao aplicar a migração: ${err.message}`);
  process.exitCode = 1;
} finally {
  await conexao?.end();
}
