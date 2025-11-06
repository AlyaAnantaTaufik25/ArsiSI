import express from "express";
import { createMataKuliah, getAllMataKuliah } from "../controllers/mataKuliahController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createMataKuliah);
router.get("/", authMiddleware, getAllMataKuliah);

export default router;