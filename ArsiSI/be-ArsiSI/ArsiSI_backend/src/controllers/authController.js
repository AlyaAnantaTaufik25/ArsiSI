import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { nama, email, password, nim } = req.body; 

    const checkSql = "SELECT * FROM mahasiswa WHERE email = ? OR nim = ?";
    db.query(checkSql, [email, nim], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "Email atau NIM sudah terdaftar" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertSql = "INSERT INTO mahasiswa (nama, email, password_hash, nim) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [nama, email, hashedPassword, nim], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Gagal mendaftar", error: err });
        }
        res.status(201).json({ message: "Registrasi berhasil!" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    const sql = "SELECT * FROM mahasiswa WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Email tidak ditemukan" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(400).json({ message: "Password salah" });
      }

      const payload = {
        mahasiswa: {
          id: user.mahasiswa_id,
          email: user.email,
          nama: user.nama
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) throw err;
          res.json({
            message: "Login berhasil!",
            token: token,
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};