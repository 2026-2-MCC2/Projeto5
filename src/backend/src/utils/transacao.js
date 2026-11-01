import pool from "../config/db.js";

// Roda `trabalho(conexao)` numa transação: se qualquer passo falhar, nada é gravado.
export default async function emTransacao(trabalho) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await trabalho(conexao);
    await conexao.commit();
    return resultado;
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
}
