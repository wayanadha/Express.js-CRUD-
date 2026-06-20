import { Router, Request, Response } from "express";
import db from "../config/database";

const router = Router();

// GET ALL FROM DB
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM mahasiswa ORDER BY id ASC"
    );
    res.json({
      message: "Data mahasiswa berhasil diambil dari database",
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

// GET DETAIL FROM DB
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.json({
      message: "Detail mahasiswa berhasil diambil dari database",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

// CREATE TO DB (dengan validasi & penanganan duplicate NIM)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { nim, nama, prodi, angkatan } = req.body;

    // 1. Validasi field wajib diisi
    if (!nim || !nama || !prodi || !angkatan) {
      return res.status(400).json({
        message: "NIM, nama, prodi, dan angkatan wajib diisi",
      });
    }

    // 2. Validasi panjang nama minimal 3 karakter
    if (nama.trim().length < 3) {
      return res.status(400).json({
        message: "Nama harus minimal 3 karakter",
      });
    }

    // 3. Eksekusi query INSERT
    const [result]: any = await db.execute(
      "INSERT INTO mahasiswa (nim, nama, prodi, angkatan) VALUES (?, ?, ?, ?)",
      [nim, nama, prodi, Number(angkatan)]
    );

    res.status(201).json({
      message: "Mahasiswa berhasil ditambahkan ke database",
      data: {
        id: result.insertId,
        nim,
        nama,
        prodi,
        angkatan: Number(angkatan),
      },
    });
  } catch (error: any) {
    console.error(error);
    // Penanganan error duplicate key (NIM unik)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "NIM sudah digunakan",
      });
    }
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
