import db from "../config/db.js";
import fs from "fs"; // <-- IMPORT BARU untuk menghapus file

// FUNGSI CREATE
export const createAgenda = (req, res) => {
  const { judul, deskripsi, tanggal, waktu, kategori, prioritas, reminder_setting } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  const file_path = req.file ? req.file.path : null; // Dapatkan path file jika ada

  const sql = "INSERT INTO agenda (judul, deskripsi, tanggal, waktu, kategori, prioritas, reminder_setting, file_path, mahasiswa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [judul, deskripsi, tanggal, waktu, kategori, prioritas, reminder_setting || null, file_path, mahasiswa_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      // Jika error, hapus file yang sudah terlanjur diupload
      if (req.file) {
        fs.unlink(req.file.path, () => {}); 
      }
      return res.status(500).json({ message: "Gagal membuat agenda", error: err });
    }
    res.status(201).json({ message: "Agenda berhasil dibuat!" });
  });
};

// FUNGSI GET ALL (Tidak ada perubahan signifikan, hanya memastikan)
export const getAllAgenda = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  
  const sql = "SELECT * FROM agenda WHERE mahasiswa_id = ?";
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil agenda", error: err });
    }
    res.json(results);
  });
};

// FUNGSI UPDATE
export const updateAgenda = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, tanggal, waktu, kategori, prioritas, reminder_setting } = req.body;
  const mahasiswa_id = req.mahasiswa.id;
  let new_file_path = req.file ? req.file.path : null; // Dapatkan path file baru

  // 1. Ambil path file lama
  const findSql = "SELECT file_path FROM agenda WHERE agenda_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil data agenda lama", error: err });
    }
    if (results.length === 0) {
      if (req.file) {
        fs.unlink(req.file.path, () => {}); // Clean up file baru jika agenda tidak ditemukan
      }
      return res.status(404).json({ message: "Agenda tidak ditemukan atau bukan milik Anda" });
    }

    const oldFilePath = results[0].file_path;

    // 2. Update data di database
    const updateSql = `UPDATE agenda 
                       SET judul = ?, deskripsi = ?, tanggal = ?, waktu = ?, 
                           kategori = ?, prioritas = ?, reminder_setting = ?
                       ${new_file_path ? ", file_path = ?" : ""}
                       WHERE agenda_id = ? AND mahasiswa_id = ?`;
    
    const params = [judul, deskripsi, tanggal, waktu, kategori, prioritas, reminder_setting || null];
    if (new_file_path) {
      params.push(new_file_path);
    }
    params.push(id, mahasiswa_id);

    db.query(updateSql, params, (err, result) => {
      if (err) {
        if (req.file) {
          fs.unlink(req.file.path, () => {}); // Clean up file baru jika update gagal
        }
        return res.status(500).json({ message: "Gagal meng-update agenda", error: err });
      }

      // 3. Jika ada file baru, hapus file lama
      if (new_file_path && oldFilePath) {
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Gagal menghapus file fisik lama:", unlinkErr);
          }
        });
      }
      res.json({ message: "Agenda berhasil di-update!" });
    });
  });
};

// FUNGSI DELETE
export const deleteAgenda = (req, res) => {
  const { id } = req.params;
  const mahasiswa_id = req.mahasiswa.id;

  // 1. Cari path filenya dulu
  const findSql = "SELECT file_path FROM agenda WHERE agenda_id = ? AND mahasiswa_id = ?";
  db.query(findSql, [id, mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error database", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Agenda tidak ditemukan atau bukan milik Anda" });
    }

    const filePath = results[0].file_path;

    // 2. Hapus data dari database
    const deleteSql = "DELETE FROM agenda WHERE agenda_id = ? AND mahasiswa_id = ?";
    db.query(deleteSql, [id, mahasiswa_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal menghapus agenda", error: err });
      }

      // 3. Hapus file fisik dari folder 'uploads' (jika ada)
      if (filePath) {
          fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                  console.error("Gagal menghapus file fisik:", unlinkErr);
                  return res.json({ message: "Agenda berhasil dihapus dari database, tapi file fisik gagal dihapus." });
              }
              res.json({ message: "Agenda dan file berhasil dihapus!" });
          });
      } else {
          res.json({ message: "Agenda berhasil dihapus!" });
      }
    });
  });
};