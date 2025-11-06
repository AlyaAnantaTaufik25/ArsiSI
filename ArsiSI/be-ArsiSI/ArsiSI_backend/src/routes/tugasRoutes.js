import express from "express";
import {
  createTugas,
  getAllTugasSaya,
  getPublicTugas,
  updateTugas,
  deleteTugas,
} from "../controllers/tugasController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTugas);
router.get("/saya", authMiddleware, getAllTugasSaya);
router.get("/publik", authMiddleware, getPublicTugas);
router.put("/:id", authMiddleware, updateTugas);
router.delete("/:id", authMiddleware, deleteTugas);

export default router;