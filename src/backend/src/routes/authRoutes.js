import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/registrar", authController.registrar);
router.post("/login", authController.login);
router.post("/esqueci-senha", authController.esqueciSenha);
router.post("/redefinir-senha", authController.redefinirSenha);
router.get("/eu", autenticar, authController.eu);

export default router;
