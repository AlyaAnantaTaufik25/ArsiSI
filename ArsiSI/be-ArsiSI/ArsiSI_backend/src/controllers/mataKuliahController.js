import db from "../config/db.js";

export const createMataKuliah = (req, res) => {
  const { nama_matakuliah, kode_matakuliah } = req.body;
  const mahasiswa_id = req.mahasiswa.id;

  const sql = "INSERT INTO mata_kuliah (nama_matakuliah, kode_matakuliah, mahasiswa_id) VALUES (?, ?, ?)";
  
  db.query(sql, [nama_matakuliah, kode_matakuliah, mahasiswa_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Gagal menyimpan mata kuliah", error: err });
    }
    res.status(201).json({ message: "Mata kuliah berhasil dibuat!", id: result.insertId });
  });
};

export const getAllMataKuliah = (req, res) => {
  const mahasiswa_id = req.mahasiswa.id;
  
  const sql = "SELECT * FROM mata_kuliah WHERE mahasiswa_id = ?";
  
  db.query(sql, [mahasiswa_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil mata kuliah", error: err });
    }
    res.json(results);
  });
};