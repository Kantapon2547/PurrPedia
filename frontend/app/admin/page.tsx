"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface Submission {
  id: number;
  title: string;
  submission_type: string;
  status: string;
  submitted_by: string;
  created_at: string;
  content: string;
}

export default function AdminPage() {
  const { token, isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Normalize API response
  const normalize = (data: any) =>
    Array.isArray(data) ? data : data?.results || [];

  useEffect(() => {
  if (!isLoggedIn) {
    router.push("/login");
    return;
  }

  if (!isAdmin) {
    router.push("/dashboard");
    return;
  }

  if (!token) return; // ✅ IMPORTANT FIX

  loadData();
}, [isAdmin, isLoggedIn, token]);

  const loadData = async () => {
    if (!token) return; // ✅ extra safety
    console.log("TOKEN USED:", token); // 👈 debug
    setLoading(true);
    try {
      const r = await apiFetch("/submissions/", {}, token);
      const data = await r.json();
      console.log("DATA:", data); // 👈 debug
      setSubmissions(normalize(data));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const reviewSubmission = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    await apiFetch(
      `/submissions/${id}/review/`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      token
    );

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // 📊 Stats
  const total = submissions.length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "2rem" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "#6b7280" }}>
          Manage cat breed submissions and content.
        </p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard title="Total Submissions" value={total} color="#f97316" />
        <StatCard title="Pending Review" value={pending} color="#f59e0b" />
        <StatCard title="Approved" value={approved} color="#16a34a" />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <p style={{ padding: "1rem" }}>Loading...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>

            {/* HEADER */}
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {["Breed Name", "Submitted By", "Date", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                        color: "#6b7280",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>

                  <td style={tdStyle}>{s.title}</td>
                  <td style={tdStyle}>{s.submitted_by}</td>
                  <td style={tdStyle}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge status={s.status} />
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "0.75rem" }}>

                      <button style={iconBtn}>👁️</button>

                      {s.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              reviewSubmission(s.id, "approved")
                            }
                            style={iconBtn}
                          >
                            ✔️
                          </button>
                          <button
                            onClick={() =>
                              reviewSubmission(s.id, "rejected")
                            }
                            style={iconBtn}
                          >
                            ❌
                          </button>
                        </>
                      )}

                      <button style={iconBtn}>✏️</button>
                      <button style={{ ...iconBtn, color: "red" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}

              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "1rem", textAlign: "center" }}>
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* 🎨 Components */

const StatCard = ({ title, value, color }: any) => (
  <div
    style={{
      background: "white",
      padding: "1.5rem",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
    }}
  >
    <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{title}</p>
    <h2 style={{ color, fontSize: "1.8rem", fontWeight: 700 }}>{value}</h2>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    approved: { bg: "#dcfce7", color: "#16a34a" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <span
      style={{
        padding: "0.25rem 0.7rem",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 600,
        background: styles[status]?.bg,
        color: styles[status]?.color,
      }}
    >
      {status}
    </span>
  );
};

const tdStyle = {
  padding: "1rem",
  fontSize: "0.9rem",
  color: "#374151",
};

const iconBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1rem",
};