import { Router } from "express";
import * as eventosController from "../controllers/eventosController.js";
import * as itensController from "../controllers/itensController.js";
import { autenticar, permitirPerfis } from "../middlewares/autenticacao.js";

const router = Router();
const soOrganizador = permitirPerfis("organizador");

// Ler: qualquer usuário logado (o fornecedor precisa ver os eventos para mandar propostas).
router.use(autenticar);
router.get("/", eventosController.listar);           // ?organizador_id=2&status=rascunho (opcionais)
router.get("/:id", eventosController.buscarPorId);
router.get("/:id/itens", itensController.listar);

// Escrever: só organizador, e só nos próprios eventos (conferido no service).
router.post("/", soOrganizador, eventosController.criar);   // pode incluir "itens": [...]
router.put("/:id", soOrganizador, eventosController.atualizar);
router.delete("/:id", soOrganizador, eventosController.remover);
router.put("/:id/itens", soOrganizador, itensController.substituir);

export default router;
