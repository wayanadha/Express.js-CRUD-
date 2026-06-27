"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { getUser, logout } from "@/lib/auth";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  User,
  UserInput
} from "@/lib/api";

const initialForm: UserInput = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
};

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserInput>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "admin") {
      window.location.href = "/mahasiswa";
      return;
    }

    setCurrentUser(user);
    loadUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");
    setError("");
    setTempPassword("");

    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
        setMessage("User berhasil diperbarui.");
      } else {
        if (!form.password) {
          setError("Password wajib diisi untuk user baru.");
          setSubmitLoading(false);
          return;
        }
        await createUser(form);
        setMessage("User berhasil ditambahkan.");
      }

      setForm(initialForm);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses data.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // leave empty when editing
      role: user.role,
    });
    setTempPassword("");
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    setSelectedUser(null);
    setForm(initialForm);
    setTempPassword("");
  };

  const handleDelete = async (id: number) => {
    if (currentUser?.id === id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }

    const confirmed = window.confirm("Yakin ingin menghapus user ini?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      setTempPassword("");
      await deleteUser(id);
      setMessage("User berhasil dihapus.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user.");
    }
  };

  const handleResetPassword = async (id: number) => {
    const confirmed = window.confirm("Yakin ingin mereset password user ini?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      const result = await resetPassword(id);
      setTempPassword(result.temporaryPassword);
      setMessage("Password berhasil direset!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset password.");
    }
  };

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1 style={{ marginBottom: "4px" }}>Manajemen User</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Kelola hak akses sistem, tambah administrator, operator, atau viewer.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/mahasiswa">
            <button className="btn-secondary">&larr; Dashboard Mahasiswa</button>
          </Link>
          <button className="btn-danger" onClick={logout}>
            Keluar
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}
      {tempPassword && (
        <div className="message" style={{ backgroundColor: "#fef3c7", color: "#b45309", borderColor: "#f59e0b" }}>
          <strong>Password Sementara: </strong> {tempPassword} 
          <span style={{ fontSize: "0.85rem", marginLeft: "10px" }}>(Catat password ini karena tidak akan ditampilkan lagi)</span>
        </div>
      )}

      <div className="grid">
        {/* FORM USER */}
        <form onSubmit={handleSubmit} className="card">
          <h2>{selectedUser ? "Ubah Akun User" : "Registrasi User Baru"}</h2>
          
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="budi@kampus.ac.id"
              required
            />
          </div>

          {!selectedUser && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role / Peran</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                outline: "none"
              }}
            >
              <option value="admin">Admin (Akses Penuh)</option>
              <option value="operator">Operator (Melihat, Tambah, Edit)</option>
              <option value="viewer">Viewer (Hanya Melihat)</option>
            </select>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={submitLoading}>
              {submitLoading ? "Menyimpan..." : selectedUser ? "Update" : "Simpan"}
            </button>
            {selectedUser && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>

        {/* TABEL USER */}
        <section className="card">
          <h2>Daftar Pengguna</h2>
          {loading ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>Memuat daftar user...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>Belum ada data user.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ marginTop: "12px" }}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          backgroundColor: user.role === "admin" ? "var(--danger-light)" : (user.role === "operator" ? "rgba(245, 158, 11, 0.12)" : "var(--success-light)"),
                          color: user.role === "admin" ? "var(--danger)" : (user.role === "operator" ? "#d97706" : "var(--success)"),
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="actions" style={{ margin: 0, gap: "4px" }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEdit(user)}
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleResetPassword(user.id)}
                            style={{ padding: "6px 10px", fontSize: "0.8rem", backgroundColor: "#fef3c7", color: "#d97706" }}
                          >
                            Reset
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(user.id)}
                            disabled={currentUser?.id === user.id}
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
