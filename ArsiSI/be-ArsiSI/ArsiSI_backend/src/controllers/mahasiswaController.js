import db from "../config/db.js";
import fs from "fs"; 

// FUNGSI GET PROFIL
export const getMahasiswa = (req, res) => {
  // ID diambil dari token/authMiddleware
  const mahasiswa_id = req.mahasiswa.id; 

  // Ambil data penting saja, jangan ambil password_hash
  const sql = "SELECT mahasiswa_id, nim, nama, email, angkatan, foto_profil FROM mahasiswa WHERE mahasiswa_id = ?";
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching profile", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(results[0]);
  });
};

// FUNGSI UPDATE PROFIL
export const updateMahasiswa = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  // req.body adalah field teks (nama, angkatan), req.file adalah foto
  const { nama, angkatan } = req.body; 
  let new_foto_path = req.file ? req.file.path : null;

  // 1. Ambil data lama untuk hapus foto lama (jika ada)
  const findSql = "SELECT foto_profil FROM mahasiswa WHERE mahasiswa_id = ?";
  db.query(findSql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil data lama", error: err });
    }
    const oldFotoPath = results[0].foto_profil;

    // 2. Susun query update (dinamis tergantung apakah ada file baru)
    const updateSql = `UPDATE mahasiswa 
                       SET nama = ?, angkatan = ?
                       ${new_foto_path ? ", foto_profil = ?" : ""}
                       WHERE mahasiswa_id = ?`;
    
    const params = [nama, angkatan];
    if (new_foto_path) {
      params.push(new_foto_path);
    }
    params.push(mahasiswa_id);

    db.query(updateSql, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal meng-update profile", error: err });
      }

      // 3. Jika ada foto baru, hapus foto lama
      if (new_foto_path && oldFotoPath) {
        fs.unlink(oldFotoPath, (unlinkErr) => {
          if (unlinkErr) console.error("Gagal hapus foto lama:", unlinkErr);
        });
      }
      res.json({ message: "Profile berhasil di-update!" });
    });
  });
};