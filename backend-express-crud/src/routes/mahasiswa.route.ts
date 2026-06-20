import { Router, Request, Response } from "express";
import { mahasiswa, Mahasiswa } from "../data/mahasiswa.data";

const router = Router();

// GET ALL
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Data mahasiswa berhasil diambil",
    data: mahasiswa,
  });
});

router.get("/search/:keyword", (req: Request, res: Response) => {
  const keyword = (req.params.keyword as string).toLowerCase();
  const result = mahasiswa.filter((item) =>
    item.nama.toLowerCase().includes(keyword)
  );

  res.json({
    message: `Pencarian mahasiswa dengan kata kunci "${req.params.keyword}" berhasil`,
    data: result,
  });
});

// GET DETAIL
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = mahasiswa.find((item) => item.id === id);

  if (!data) {
    return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
  }

  res.json({
    message: "Detail mahasiswa berhasil diambil",
    data,
  });
});

// CREATE (dengan validasi - Latihan Pertemuan 2)
router.post("/", (req: Request, res: Response) => {
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

  // 3. Validasi keunikan NIM
  const isNimExist = mahasiswa.some((item) => item.nim === nim);
  if (isNimExist) {
    return res.status(400).json({
      message: "NIM sudah digunakan",
    });
  }

  // Generate ID baru secara dinamis
  const newId = mahasiswa.length > 0 ? Math.max(...mahasiswa.map((m) => m.id)) + 1 : 1;

  const newMahasiswa: Mahasiswa = {
    id: newId,
    nim,
    nama,
    prodi,
    angkatan: Number(angkatan),
  };

  mahasiswa.push(newMahasiswa);

  res.status(201).json({
    message: "Mahasiswa berhasil ditambahkan",
    data: newMahasiswa,
  });
});

// UPDATE (dengan validasi)
router.put("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nim, nama, prodi, angkatan } = req.body;

  const index = mahasiswa.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
  }

  // Validasi field wajib diisi
  if (!nim || !nama || !prodi || !angkatan) {
    return res.status(400).json({
      message: "NIM, nama, prodi, dan angkatan wajib diisi",
    });
  }

  // Validasi panjang nama
  if (nama.trim().length < 3) {
    return res.status(400).json({
      message: "Nama harus minimal 3 karakter",
    });
  }

  // Validasi keunikan NIM (selain mahasiswa yang di-update)
  const isNimExist = mahasiswa.some((item) => item.nim === nim && item.id !== id);
  if (isNimExist) {
    return res.status(400).json({
      message: "NIM sudah digunakan oleh mahasiswa lain",
    });
  }

  mahasiswa[index] = {
    id,
    nim,
    nama,
    prodi,
    angkatan: Number(angkatan),
  };

  res.json({
    message: "Mahasiswa berhasil diperbarui",
    data: mahasiswa[index],
  });
});

// DELETE
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = mahasiswa.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
  }

  const deletedData = mahasiswa.splice(index, 1);

  res.json({
    message: "Mahasiswa berhasil dihapus",
    data: deletedData[0],
  });
});

export default router;
