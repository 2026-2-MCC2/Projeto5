import { Router } from "express";
import * as eventosController from "../controllers/eventosController.js";

const router = Router();

router.get("/", eventosController.listar);           // ?organizador_id=2&status=rascunho (opcionais)
router.post("/", eventosController.criar);
router.get("/:id", eventosController.buscarPorId);
router.put("/:id", eventosController.atualizar);
router.delete("/:id", eventosController.remover);

export default router;
