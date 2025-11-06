import express from "express";
import { 
  createDokumen, 
  getAllDokumen,
  updateDokumen, // <-- 1. IMPORT FUNGSI BARU
  deleteDokumen
} from "../controllers/dokumenController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), createDokumen);
router.get("/", authMiddleware, getAllDokumen);
router.put("/:id", authMiddleware, upload.single("file"), updateDokumen); // <-- 2. TAMBAHKAN BARIS INI (PAKAI upload.single lagi)
router.delete("/:id", authMiddleware, deleteDokumen);

export default router;