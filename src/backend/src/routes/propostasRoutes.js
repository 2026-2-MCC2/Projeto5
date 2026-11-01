import { Router } from "express";
import * as propostasController from "../controllers/propostasController.js";
import { autenticar, permitirPerfis } from "../middlewares/autenticacao.js";

// Rotas de propostas que não ficam sob um evento. As do evento estão em eventosRoutes.js.
const router = Router();

router.get("/minhas", autenticar, permitirPerfis("fornecedor"), propostasController.listarMinhas);

export default router;
