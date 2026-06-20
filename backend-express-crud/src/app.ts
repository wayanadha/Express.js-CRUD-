import express from "express";
import cors from "cors";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import mahasiswaDbRoutes from "./routes/mahasiswa-db.route";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware (Pertemuan 2)
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route Utama
app.get("/", (req, res) => {
  res.json({ message: "API Express CRUD berjalan" });
});

// Route Mahasiswa CRUD
app.use("/api/mahasiswa", mahasiswaRoutes);

// Route Mahasiswa Database CRUD (Pertemuan 3)
app.use("/api/db/mahasiswa", mahasiswaDbRoutes);

export default app;
