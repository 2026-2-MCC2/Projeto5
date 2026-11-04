import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { autenticar, permitirPerfis } from "../middlewares/autenticacao.js";

const router = Router();

// Todas as rotas daqui exigem login de admin.
router.use(autenticar, permitirPerfis("admin"));

router.get("/pendentes", adminController.listarPendentes);
router.get("/usuarios", adminController.listarUsuarios);
router.patch("/usuarios/:id/aprovar", adminController.aprovar);
router.patch("/usuarios/:id/rejeitar", adminController.rejeitar); // corpo: { "motivo": "..." }

export default router;
