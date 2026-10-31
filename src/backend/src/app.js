import express from "express";
import cors from "cors";
import env from "./config/env.js";
import rotas from "./routes/index.js";
import { naoEncontrado, tratarErros } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: env.frontUrls }));
app.use(express.json());

app.use("/api", rotas);

// Precisam ficar por último: 404 para rotas desconhecidas e o tratamento central de erros.
app.use(naoEncontrado);
app.use(tratarErros);

export default app;
