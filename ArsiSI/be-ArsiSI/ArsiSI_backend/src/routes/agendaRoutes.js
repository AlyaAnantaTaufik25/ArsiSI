import express from "express";
import { 
  createAgenda, 
  getAllAgenda,
  updateAgenda,
  deleteAgenda
} from "../controllers/agendaController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; 

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), createAgenda); 
router.get("/", authMiddleware, getAllAgenda);
router.put("/:id", authMiddleware, upload.single("file"), updateAgenda); 
router.delete("/:id", authMiddleware, deleteAgenda);

export default router;