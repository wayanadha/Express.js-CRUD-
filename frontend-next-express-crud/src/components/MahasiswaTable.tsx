"use client";

import { Mahasiswa } from "@/lib/api";

type Props = {
  mahasiswa: Mahasiswa[];
  role: string | null;
  onEdit: (item: Mahasiswa) => void;
  onDelete: (id: number) => Promise<void>;
};

export default function MahasiswaTable({
  mahasiswa,
  role,
  onEdit,
  onDelete,
}: Props) {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const canEdit = role === "admin" || role === "operator";
  const canDelete = role === "admin";

  if (mahasiswa.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--text-secondary)",
        }}
      >
        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 500 }}>
          Belum ada data mahasiswa terdaftar.
        </p>
        <p style={{ margin: "6px 0 0", fontSize: "0.9rem", opacity: 0.75 }}>
          Gunakan form di atas untuk meregistrasikan mahasiswa baru atau periksa kembali kata kunci pencarian Anda.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Foto</th>
            <th>NIM</th>
            <th>Nama</th>
            <th>Prodi</th>
            <th>Angkatan</th>
            {(canEdit || canDelete) && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {mahasiswa.map((item, index) => {
            const avatarUrl = item.foto
              ? `${BACKEND_URL}/uploads/mahasiswa/${item.foto}`
              : null;

            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={item.nama}
                      width={40}
                      height={40}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border)",
                      }}
                      onError={(e) => {
                        // fallback if image fails to load
                        (e.target as HTMLElement).style.display = "none";
                        const sib = (e.target as HTMLElement).nextElementSibling;
                        if (sib) sib.removeAttribute("style");
                      }}
                    />
                  ) : null}
                  {!avatarUrl || avatarUrl ? (
                    <div
                      className="fallback-avatar"
                      style={{
                        display: avatarUrl ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.nama.charAt(0).toUpperCase()}
                    </div>
                  ) : null}
                </td>
                <td>{item.nim}</td>
                <td>
                  <strong>{item.nama}</strong>
                </td>
                <td>{item.nama_prodi}</td>
                <td>{item.angkatan}</td>
                {(canEdit || canDelete) && (
                  <td>
                    <div className="actions" style={{ margin: 0 }}>
                      {canEdit && (
                        <button
                          className="btn-secondary"
                          onClick={() => onEdit(item)}
                          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-danger"
                          onClick={() => onDelete(item.id)}
                          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
