import { Router } from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import eventosRoutes from "./eventosRoutes.js";

// Todas as rotas da API ficam sob /api.
const router = Router();

router.get("/saude", (req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/eventos", eventosRoutes);

export default router;
