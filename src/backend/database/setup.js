// Cria o banco rodando schema.sql e seed.sql com os dados do .env.
//   npm run db:criar     → cria do zero (para se o banco já existir)
//   npm run db:recriar   → APAGA o banco e cria de novo, com os dados de exemplo
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import env from "../src/config/env.js";

const recriar = process.argv.includes("--recriar");
const { database, ...acesso } = env.db;

// Os arquivos .sql usam o nome "trocaticket"; se DB_NAME for outro, troca só no
// CREATE DATABASE e no USE (e não em textos como "admin@trocaticket.com").
const lerSql = async (arquivo) =>
  (await readFile(new URL(arquivo, import.meta.url), "utf8"))
    .replace(/\b(DATABASE IF NOT EXISTS|USE)\s+trocaticket\b/g, `$1 \`${database}\``);

const conexao = await mysql.createConnection({ ...acesso, multipleStatements: true });

try {
  const [existe] = await conexao.query("SHOW DATABASES LIKE ?", [database]);
  if (existe.length && !recriar) {
    console.error(`O banco "${database}" já existe. Nada foi alterado.`);
    console.error('Para apagar e criar de novo (perde todos os dados), rode: npm run db:recriar');
    process.exitCode = 1;
  } else {
    if (existe.length) {
      await conexao.query(`DROP DATABASE \`${database}\``);
      console.log(`Banco "${database}" apagado.`);
    }
    await conexao.query(await lerSql("./schema.sql"));
    console.log("schema.sql executado: tabelas criadas.");
    await conexao.query(await lerSql("./seed.sql"));
    console.log("seed.sql executado: dados de exemplo inseridos.");
  }
} catch (err) {
  console.error(`Erro ao criar o banco: ${err.message}`);
  process.exitCode = 1;
} finally {
  await conexao.end();
}
