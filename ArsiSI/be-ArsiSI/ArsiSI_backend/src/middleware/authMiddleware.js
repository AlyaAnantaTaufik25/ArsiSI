import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.mahasiswa = decoded.mahasiswa;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token tidak valid, otorisasi ditolak" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Tidak ada token, otorisasi ditolak" });
  }
};

export default authMiddleware;