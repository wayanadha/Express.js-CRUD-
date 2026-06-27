import express from "express";
import cors from "cors";
import path from "path";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import prodiRoutes from "./routes/prodi.route";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route Utama
app.get("/", (req, res) => {
  res.json({ message: "API Express CRUD berjalan" });
});

// Register Routes
app.use("/api/prodi", prodiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);

export default app;
