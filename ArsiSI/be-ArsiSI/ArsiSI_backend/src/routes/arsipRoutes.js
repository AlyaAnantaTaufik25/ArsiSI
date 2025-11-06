import express from "express";
import { 
  createArsip, 
  getAllArsip,
  updateArsip,
  deleteArsip
} from "../controllers/arsipController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), createArsip);
router.get("/", authMiddleware, getAllArsip);
router.put("/:id", authMiddleware, upload.single("file"), updateArsip);
router.delete("/:id", authMiddleware, deleteArsip);

export default router;