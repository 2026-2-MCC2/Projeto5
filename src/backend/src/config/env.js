import dotenv from "dotenv";

// Carrega o src/backend/.env. Variáveis já definidas no sistema têm prioridade.
dotenv.config({ path: new URL("../../.env", import.meta.url), quiet: true });

const env = {
  porta: Number(process.env.PORT) || 3001,
  frontUrls: (process.env.FRONT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "trocaticket",
  },
};

export default env;
