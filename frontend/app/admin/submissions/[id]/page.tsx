"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch(`/submissions/${id}/`, {});

        if (!res.ok) {
          setError(`Failed to load (HTTP ${res.status})`);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch {
        setError("Network error while fetching data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const updateStatus = async (status: "approved" | "rejected") => {
    try {
      setActionLoading(true);

      const res = await apiFetch(`/submissions/${id}/review/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setData((prev: any) => ({ ...prev, status }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>
          <p>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={container}>
        <div style={{ ...card, border: "1px solid red" }}>
          <p style={{ color: "red" }}>{error}</p>
          <button style={btn} onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={container}>
        <div style={card}>
          <p>No data found</p>
        </div>
      </div>
    );
  }

  const statusColor =
    data.status === "approved"
      ? "#16a34a"
      : data.status === "rejected"
      ? "#dc2626"
      : "#f59e0b";

  return (
    <div style={container}>
      <div style={card}>
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ marginBottom: 8 }}>{data.title}</h1>

          <span style={{ ...badge, background: statusColor }}>
            {data.status}
          </span>
        </div>

        {/* META */}
        <div style={metaBox}>
          <p><b>Type:</b> {data.submission_type}</p>
          <p><b>Submitted by:</b> {data.submitted_by}</p>
          <p>
            <b>Date:</b>{" "}
            {data.created_at
              ? new Date(data.created_at).toLocaleString()
              : "-"}
          </p>
        </div>

        {/* CONTENT */}
        <div style={contentBox}>
          {data.content}
        </div>

        {/* ACTIONS */}
        <div style={actionBox}>
          <button style={btn} onClick={() => router.back()}>
            Back
          </button>

          <button
            style={btn}
            onClick={() => router.push(`/admin/submissions/${id}/edit`)}
          >
            Edit
          </button>

          {data.status === "pending" && (
            <>
              <button
                style={{ ...btn, background: "#16a34a", color: "white" }}
                disabled={actionLoading}
                onClick={() => updateStatus("approved")}
              >
                Approve
              </button>

              <button
                style={{ ...btn, background: "#dc2626", color: "white" }}
                disabled={actionLoading}
                onClick={() => updateStatus("rejected")}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const container: React.CSSProperties = {
  padding: "2rem",
  maxWidth: 900,
  margin: "0 auto",
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "2rem",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  color: "white",
  fontSize: "0.8rem",
  textTransform: "capitalize",
};

const metaBox: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#555",
  marginBottom: "1rem",
  lineHeight: 1.6,
};

const contentBox: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  background: "#f9f9f9",
  padding: "1rem",
  borderRadius: 8,
  marginTop: "1rem",
};

const actionBox: React.CSSProperties = {
  marginTop: "2rem",
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
};

const btn: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
};