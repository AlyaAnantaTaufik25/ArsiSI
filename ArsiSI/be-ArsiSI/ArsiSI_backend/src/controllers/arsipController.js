import db from "../config/db.js";
import fs from "fs"; // <-- Untuk menghapus file

// FUNGSI CREATE
export const createArsip = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang di-upload" });
  }

  const { judul, deskripsi, tanggal, kategori } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  const file_path = req.file.path;

  const sql = "INSERT INTO arsip (judul, deskripsi, tanggal, kategori, mahasiswa_id, file_path) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [judul, deskripsi, tanggal, kategori, mahasiswa_id, file_path], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal menyimpan arsip", error: err });
    }
    res.status(201).json({ message: "Arsip berhasil di-upload!", data: req.file });
  });
};

// FUNGSI GET ALL
export const getAllArsip = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  
  const sql = `SELECT * FROM arsip WHERE mahasiswa_id = ? ORDER BY tanggal DESC`;
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil arsip", error: err });
    }
    res.json(results);
  });
};

// FUNGSI UPDATE (BARU)
export const updateArsip = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, tanggal, kategori } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  let file_path = req.file ? req.file.path : null;

  const findSql = "SELECT file_path FROM arsip WHERE arsip_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil arsip lama", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan atau bukan milik Anda" });
    }

    const oldFilePath = results[0].file_path;

    const updateSql = `UPDATE arsip 
                       SET judul = ?, deskripsi = ?, tanggal = ?, kategori = ?
                       ${file_path ? ", file_path = ?" : ""}
                       WHERE arsip_id = ? AND mahasiswa_id = ?`;
    
    const params = [judul, deskripsi, tanggal, kategori];
    if (file_path) {
      params.push(file_path);
    }
    params.push(id, mahasiswa_id);

    db.query(updateSql, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal meng-update arsip", error: err });
      }
      if (file_path && oldFilePath) {
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) console.error("Gagal hapus file lama:", unlinkErr);
        });
      }
      res.json({ message: "Arsip berhasil di-update!" });
    });
  });
};

// FUNGSI DELETE (BARU)
export const deleteArsip = (req, res) => {
  const { id } = req.params;
  const mahasiswa_id = req.mahasiswa.id;

  const findSql = "SELECT file_path FROM arsip WHERE arsip_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error database", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const filePath = results[0].file_path;

    const deleteSql = "DELETE FROM arsip WHERE arsip_id = ? AND mahasiswa_id = ?";
    db.query(deleteSql, [id, mahasiswa_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal menghapus arsip", error: err });
      }

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Gagal menghapus file fisik:", unlinkErr);
          return res.json({ message: "Arsip dihapus dari database, tapi file fisik gagal dihapus." });
        }
        res.json({ message: "Arsip dan file berhasil dihapus!" });
      });
    });
  });
};