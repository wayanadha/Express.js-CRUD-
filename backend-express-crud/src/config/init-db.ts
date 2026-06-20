import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { mahasiswa } from "../data/mahasiswa.data";

dotenv.config();

async function init() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT || 3000);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "db_kampus";

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    // 1. Buat Database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" berhasil dipersiapkan.`);

    // 2. Gunakan Database
    await connection.query(`USE \`${dbName}\``);

    // 3. Drop tabel lama untuk sinkronisasi data baru secara bersih
    await connection.query("DROP TABLE IF EXISTS mahasiswa");
    console.log("Tabel lama 'mahasiswa' dihapus untuk sinkronisasi data baru.");

    // 4. Buat kembali tabel mahasiswa
    const createTableQuery = `
      CREATE TABLE mahasiswa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nim VARCHAR(20) NOT NULL UNIQUE,
        nama VARCHAR(100) NOT NULL,
        prodi VARCHAR(100) NOT NULL,
        angkatan INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.query(createTableQuery);
    console.log("Tabel 'mahasiswa' berhasil dibuat.");

    // 5. Masukkan data terbaru dari src/data/mahasiswa.data.ts
    if (mahasiswa.length > 0) {
      const values = mahasiswa.map((m) => [m.id, m.nim, m.nama, m.prodi, m.angkatan]);
      await connection.query(
        "INSERT INTO mahasiswa (id, nim, nama, prodi, angkatan) VALUES ?",
        [values]
      );
      console.log(`Berhasil menyinkronkan ${mahasiswa.length} data mahasiswa dari file data ke MySQL.`);
    }

    await connection.end();
    console.log("Sinkronisasi database selesai dengan sukses!");
  } catch (error) {
    console.error("Sinkronisasi database gagal:", error);
    process.exit(1);
  }
}

init();
