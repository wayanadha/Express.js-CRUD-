import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "9999px",
          backgroundColor: "var(--primary-light)",
          color: "var(--primary)",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "20px"
        }}>
          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></span>
          Next.js &bull; Express.js REST API
        </div>
        
        <h1 style={{ 
          background: "linear-gradient(135deg, var(--primary), #8b5cf6)", 
          WebkitBackgroundClip: "text", 
          WebkitTextFillColor: "transparent",
          fontSize: "2.5rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          marginBottom: "16px"
        }}>
          Database Mahasiswa Hub
        </h1>
        
        <p style={{
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "var(--text-secondary)",
          maxWidth: "600px",
          marginBottom: "28px"
        }}>
          Sistem informasi akademik real-time dengan integrasi REST API berkinerja tinggi. 
          Kelola, pantau, dan perbarui data mahasiswa secara efisien dalam satu dashboard terpadu.
        </p>
        
        <Link href="/mahasiswa">
          <button className="btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            Mulai Kelola Data <span style={{ marginLeft: "4px", transition: "transform 0.2s" }} className="arrow">&rarr;</span>
          </button>
        </Link>
      </div>
    </main>
  );
}

