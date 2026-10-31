import mysql from "mysql2/promise";
import env from "./env.js";

// Pool de conexões: reaproveita conexões em vez de abrir uma por requisição.
const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  decimalNumbers: true, // DECIMAL volta como número (ex.: 0.25), não como string
  dateStrings: true,    // DATETIME volta como "2026-12-12 11:00:00", sem conversão de fuso
});

export async function testarConexao() {
  const conexao = await pool.getConnection();
  conexao.release();
}

export default pool;
