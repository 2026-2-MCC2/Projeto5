import { Router } from "express";
import eventosRoutes from "./eventosRoutes.js";

// Todas as rotas da API ficam sob /api.
const router = Router();

router.get("/saude", (req, res) => res.json({ status: "ok" }));
router.use("/eventos", eventosRoutes);

export default router;
