"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const { token, isAdmin, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const normalize = (data: any) =>
    Array.isArray(data) ? data : data?.results || [];

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (!token) return;

    loadData();
  }, [isAdmin, isLoggedIn, token, loading]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      const r = await apiFetch("/submissions/", {}, token);
      const data = await r.json();
      setSubmissions(normalize(data));
    } catch (err) {
      console.error(err);
    }
    setIsFetching(false);
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

    setSubmissions(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      const res = await apiFetch(
        `/submissions/${id}/`,
        { method: "DELETE" },
        token
      );

      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
      } else {
        console.error("Delete failed:", res.status);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const total = submissions.length;
  const pending = submissions.filter(s => s.status === "pending").length;
  const approved = submissions.filter(s => s.status === "approved").length;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            color: "var(--espresso)",
            marginBottom: "0.25rem"
          }}>
            Admin Dashboard
          </h1>

          <p style={{
            color: "var(--mocha)",
            opacity: 0.6,
            fontSize: "0.9rem"
          }}>
            Manage cat breed submissions and content.
          </p>
        </div>

        {/* STATS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          {[
            { label: "Total Submissions", value: total, color: "var(--terracotta)" },
            { label: "Pending Review", value: pending, color: "#d97706" },
            { label: "Approved", value: approved, color: "#16a34a" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "1.25rem 1.5rem"
            }}>
              <p style={{
                fontSize: "0.78rem",
                color: "var(--mocha)",
                opacity: 0.6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.4rem"
              }}>
                {label}
              </p>
              <h2 style={{ color, fontSize: "2rem", fontWeight: 700 }}>
                {value}
              </h2>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          overflow: "hidden"
        }}>
          {isFetching ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--mocha)", opacity: 0.5 }}>
              Loading…
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--espresso)" }}>
                  {["Breed Name", "Submitted By", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase"
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={tdStyleTitle}>{s.title}</td>
                    <td style={tdStyle}>{s.submitted_by}</td>
                    <td style={tdStyle}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>

                    <td style={tdStyle}>
                      <StatusBadge status={s.status} />
                    </td>

                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>

                        {/* 👁 VIEW */}
                        <Link href={`/admin/submissions/${s.id}`} style={{ textDecoration: "none" }}>
                          <span>
                            <ActionBtn color="#2563eb" title="View">👁</ActionBtn>
                          </span>
                        </Link>

                        {/* ✏️ EDIT */}
                        <Link href={`/admin/submissions/${s.id}/edit`} style={{ textDecoration: "none" }}>
                          <span>
                            <ActionBtn color="#7c3aed" title="Edit">✏️</ActionBtn>
                          </span>
                        </Link>

                        {/* ✔️ APPROVE / ❌ REJECT */}
                        {s.status === "pending" && (
                          <>
                            <ActionBtn onClick={() => reviewSubmission(s.id, "approved")} color="#16a34a" title="Approve">
                              ✔
                            </ActionBtn>

                            <ActionBtn onClick={() => reviewSubmission(s.id, "rejected")} color="#dc2626" title="Reject">
                              ✕
                            </ActionBtn>
                          </>
                        )}

                        {/* 🗑 DELETE */}
                        <ActionBtn onClick={() => deleteSubmission(s.id)} color="#dc2626" title="Delete">
                          🗑
                        </ActionBtn>

                      </div>
                    </td>
                  </tr>
                ))}

                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--mocha)", opacity: 0.4 }}>
                      No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const tdStyle = {
  padding: "0.9rem 1rem",
  fontSize: "0.875rem",
  color: "var(--mocha)",
};

const tdStyleTitle = {
  ...tdStyle,
  color: "var(--espresso)",
  fontWeight: 500,
};

const ActionBtn = ({ onClick, color, title, children }: any) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 30,
      height: 30,
      border: `1px solid ${color}22`,
      borderRadius: 3,
      background: `${color}11`,
      color,
      cursor: "pointer",
      fontSize: "0.8rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    approved: { bg: "#dcfce7", color: "#16a34a" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
  };

  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: "0.72rem",
      fontWeight: 600,
      background: s.bg,
      color: s.color
    }}>
      {status}
    </span>
  );
};