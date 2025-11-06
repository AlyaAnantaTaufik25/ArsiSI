import db from "../config/db.js";
import fs from "fs"; // <-- Untuk menghapus file lama

// FUNGSI CREATE
export const createDokumen = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang di-upload" });
  }

  const { judul, deskripsi, tanggal, kategori } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  const file_path = req.file.path;

  const sql = "INSERT INTO dokumen_akademik (judul, deskripsi, tanggal, kategori, mahasiswa_id, file_path) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [judul, deskripsi, tanggal, kategori, mahasiswa_id, file_path], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal menyimpan dokumen", error: err });
    }
    res.status(201).json({ message: "Dokumen berhasil di-upload!", data: req.file });
  });
};

// FUNGSI GET ALL
export const getAllDokumen = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  
  const sql = `SELECT * FROM dokumen_akademik WHERE mahasiswa_id = ? ORDER BY tanggal DESC`;
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil dokumen", error: err });
    }
    res.json(results);
  });
};

// FUNGSI UPDATE (BARU)
export const updateDokumen = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, tanggal, kategori } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  let file_path = req.file ? req.file.path : null; // Cek apakah ada file baru di-upload

  // 1. Ambil data dokumen lama
  const findSql = "SELECT file_path FROM dokumen_akademik WHERE dokumen_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal mengambil dokumen lama", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan atau bukan milik Anda" });
    }

    const oldFilePath = results[0].file_path;

    // 2. Update data di database
    const updateSql = `UPDATE dokumen_akademik 
                       SET judul = ?, deskripsi = ?, tanggal = ?, kategori = ?
                       ${file_path ? ", file_path = ?" : ""}
                       WHERE dokumen_id = ? AND mahasiswa_id = ?`;
    
    const params = [judul, deskripsi, tanggal, kategori];
    if (file_path) {
      params.push(file_path);
    }
    params.push(id, mahasiswa_id);

    db.query(updateSql, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal meng-update dokumen", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Dokumen tidak ditemukan atau bukan milik Anda" });
      }

      // 3. Jika ada file baru di-upload, hapus file lama
      if (file_path && oldFilePath) {
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Gagal menghapus file fisik lama:", unlinkErr);
            // Tetap kirim sukses, tapi log error
          }
        });
      }
      res.json({ message: "Dokumen berhasil di-update!" });
    });
  });
};


// FUNGSI DELETE
export const deleteDokumen = (req, res) => {
  const { id } = req.params;
  const mahasiswa_id = req.mahasiswa.id;

  // 1. Cari path filenya dulu di database
  const findSql = "SELECT file_path FROM dokumen_akademik WHERE dokumen_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error database", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan atau bukan milik Anda" });
    }

    const filePath = results[0].file_path;

    // 2. Hapus data dari database
    const deleteSql = "DELETE FROM dokumen_akademik WHERE dokumen_id = ? AND mahasiswa_id = ?";
    db.query(deleteSql, [id, mahasiswa_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal menghapus dokumen", error: err });
      }

      // 3. Hapus file fisik dari folder 'uploads'
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Gagal menghapus file fisik:", unlinkErr);
          // Kirim pesan sukses, tapi beri tahu admin filenya gagal dihapus
          return res.json({ message: "Dokumen berhasil dihapus dari database, tapi file fisik gagal dihapus." });
        }
        res.json({ message: "Dokumen dan file berhasil dihapus!" });
      });
    });
  });
};