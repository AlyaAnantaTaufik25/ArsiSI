import express from "express";
import { getMahasiswa, updateMahasiswa } from "../controllers/mahasiswaController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET PROFIL (URL: /mahasiswa/profil)
router.get("/profil", authMiddleware, getMahasiswa);

// UPDATE PROFIL (URL: /mahasiswa/profil) - Membutuhkan upload.single untuk foto
router.put("/profil", authMiddleware, upload.single("file"), updateMahasiswa);

export default router;