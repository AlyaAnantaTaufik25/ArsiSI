import express from "express";
import db from "./src/config/db.js";

import MahasiswaRoutes from "./src/routes/mahasiswaRoutes.js";
import DokumenRoutes from "./src/routes/dokumenRoutes.js";
import AgendaRoutes from "./src/routes/agendaRoutes.js";
import ArsipRoutes from "./src/routes/arsipRoutes.js";
import TugasRoutes from "./src/routes/tugasRoutes.js";
import AuthRoutes from "./src/routes/authRoutes.js";
import MataKuliahRoutes from "./src/routes/mataKuliahRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

app.use("/api/auth", AuthRoutes);

app.use("/mahasiswa", MahasiswaRoutes);
app.use("/dokumen", DokumenRoutes);
app.use("/agenda", AgendaRoutes);
app.use("/arsip", ArsipRoutes);
app.use("/tugas", TugasRoutes);
app.use("/mata-kuliah", MataKuliahRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});