"use client";

import { useState, FormEvent } from "react";
import { saveAuth } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Email atau password salah");
        return;
      }

      saveAuth(result.token, result.user);
      window.location.href = "/mahasiswa";
    } catch (err) {
      setError("Gagal menghubungi server. Pastikan API backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Selamat Datang</h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "24px",
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
          }}
        >
          Masuk untuk mengelola data akademik mahasiswa
        </p>

        {error && (
          <div className="message error" style={{ marginBottom: "20px", padding: "12px 16px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem" }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
