import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    const dbName = process.env.DB_NAME || "db_kampus";
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log("Dropping existing tables to prevent foreign key errors...");
    await connection.query("DROP TABLE IF EXISTS mahasiswa");
    await connection.query("DROP TABLE IF EXISTS prodi");
    await connection.query("DROP TABLE IF EXISTS password_reset_tokens");
    await connection.query("DROP TABLE IF EXISTS users");

    console.log("Creating table 'prodi'...");
    await connection.query(`
      CREATE TABLE prodi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_prodi VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating table 'mahasiswa'...");
    await connection.query(`
      CREATE TABLE mahasiswa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nim VARCHAR(20) NOT NULL UNIQUE,
        nama VARCHAR(100) NOT NULL,
        prodi_id INT NOT NULL,
        angkatan INT NOT NULL,
        foto VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_mahasiswa_prodi
          FOREIGN KEY (prodi_id) REFERENCES prodi(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      )
    `);

    console.log("Creating table 'users'...");
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating table 'password_reset_tokens'...");
    await connection.query(`
      CREATE TABLE password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Seeding table 'prodi'...");
    await connection.query(`
      INSERT INTO prodi (nama_prodi) VALUES
      ('Informatika'),
      ('Sistem Informasi'),
      ('Teknik Elektro'),
      ('Manajemen'),
      ('Akuntansi')
    `);

    console.log("Seeding table 'mahasiswa'...");
    await connection.query(`
      INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan) VALUES
      ('2201001', 'Ahmad Fauzi', 1, 2022),
      ('2201002', 'Siti Aminah', 2, 2022)
    `);

    console.log("Hashing passwords for seed users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Seeding table 'users'...");
    await connection.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin', 'admin@kampus.ac.id', ?, 'admin'),
      ('Operator', 'operator@kampus.ac.id', ?, 'operator'),
      ('Viewer', 'viewer@kampus.ac.id', ?, 'viewer')
    `, [hashedPassword, hashedPassword, hashedPassword]);

    console.log("Database initialized and seeded successfully!");
  } catch (error) {
    console.error("Error during database initialization:", error);
  } finally {
    await connection.end();
  }
}

initDb();
