import db from "../config/db.js";

// FUNGSI CREATE (SUDAH BENAR)
export const createTugas = (req, res) => {
  const { judul, deskripsi, link_tugas, visibility, matakuliah_id, tipetugas_id } = req.body;
  const mahasiswa_id = req.mahasiswa.id;

  const sql = "INSERT INTO tugas (judul, deskripsi, link_tugas, visibility, matakuliah_id, tipetugas_id, mahasiswa_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [judul, deskripsi, link_tugas, visibility, matakuliah_id, tipetugas_id, mahasiswa_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal menyimpan tugas", error: err });
    }
    res.status(201).json({ message: "Tugas berhasil disimpan!" });
  });
};

// FUNGSI GET ALL (SUDAH BENAR)
export const getAllTugasSaya = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  
  const sql = `
    SELECT t.*, tt.nama_tipe, mk.nama_matakuliah, mk.kode_matakuliah
    FROM tugas t
    LEFT JOIN tipe_tugas tt ON t.tipetugas_id = tt.tipetugas_id
    LEFT JOIN mata_kuliah mk ON t.matakuliah_id = mk.matakuliah_id
    WHERE t.mahasiswa_id = ?
    ORDER BY t.created_at DESC
  `;
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil tugas", error: err });
    }
    res.json(results);
  });
};

// FUNGSI GET PUBLIC (SUDAH BENAR)
export const getPublicTugas = (req, res) => {
  const sql = `
    SELECT t.*, tt.nama_tipe, mk.nama_matakuliah, mk.kode_matakuliah, m.nama AS nama_mahasiswa
    FROM tugas t
    LEFT JOIN tipe_tugas tt ON t.tipetugas_id = tt.tipetugas_id
    LEFT JOIN mata_kuliah mk ON t.matakuliah_id = mk.matakuliah_id
    LEFT JOIN mahasiswa m ON t.mahasiswa_id = m.mahasiswa_id
    WHERE t.visibility = 'public'
    ORDER BY t.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil tugas publik", error: err });
    }
    res.json(results);
  });
};

// FUNGSI UPDATE (INI YANG DIPERBAIKI)
export const updateTugas = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, link_tugas, visibility, matakuliah_id, tipetugas_id } = req.body;
  const mahasiswa_id = req.mahasiswa.id;

  const sql = `UPDATE tugas 
               SET judul = ?, deskripsi = ?, link_tugas = ?, visibility = ?, 
                   matakuliah_id = ?, tipetugas_id = ? 
               WHERE tugas_id = ? AND mahasiswa_id = ?`;
  
  db.query(sql, [judul, deskripsi, link_tugas, visibility, matakuliah_id, tipetugas_id, id, mahasiswa_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal meng-update tugas", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan atau bukan milik Anda" });
    }
    res.json({ message: "Tugas berhasil di-update!" });
  });
};

// FUNGSI DELETE (SUDAH BENAR)
export const deleteTugas = (req, res) => {
  const { id } = req.params;
  const mahasiswa_id = req.mahasiswa.id;

  const sql = "DELETE FROM tugas WHERE tugas_id = ? AND mahasiswa_id = ?";
  
  db.query(sql, [id, mahasiswa_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal menghapus tugas", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan atau bukan milik Anda" });
    }
    res.json({ message: "Tugas berhasil dihapus!" });
  });
};