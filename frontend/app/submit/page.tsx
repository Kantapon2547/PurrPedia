"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiFormData } from "../lib/api";

interface Breed { id: number; name: string; }

export default function SubmitPage() {
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [type, setType] = useState("breed");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedBreed, setRelatedBreed] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    apiFetch("/breeds/", {}, token).then(r => r.json()).then(setBreeds);
  }, [isLoggedIn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("submission_type", type);
      if (relatedBreed) fd.append("related_breed", relatedBreed);
      if (image) fd.append("image", image);
      const res = await apiFormData("/submissions/", fd, token);
      if (!res.ok) { const d = await res.json(); setError(d.error || "Submission failed."); return; }
      setSuccess(true);
      setTitle(""); setContent(""); setRelatedBreed(""); setImage(null); setType("breed");
    } catch { setError("Unable to connect."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "calc(100vh - 64px)", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "var(--espresso)", marginBottom: "0.5rem" }}>
            Share Your Knowledge
          </h1>
          <p style={{ color: "var(--mocha)", opacity: 0.65, lineHeight: 1.7 }}>
            Submit a new breed, care tip, or edit — our admins review everything before it goes live.
          </p>
        </div>

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "1rem 1.25rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ✅ Submitted successfully! An admin will review it shortly.
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "1rem 1.25rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.9rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2.5rem" }}>
          {/* Type selector */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.75rem" }}>Submission Type</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[["breed", "New Breed"], ["edit", "Edit Breed"], ["care_tip", "Care Tip"]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setType(val)} style={{
                  padding: "0.5rem 1.25rem", borderRadius: 2, fontSize: "0.85rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  background: type === val ? "var(--terracotta)" : "transparent",
                  color: type === val ? "white" : "var(--mocha)",
                  border: `1.5px solid ${type === val ? "var(--terracotta)" : "var(--border)"}`,
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Title *</label>
              <input className="input-field" type="text" placeholder={type === "breed" ? "e.g. Scottish Fold" : type === "edit" ? "What are you correcting?" : "e.g. Brushing a Persian Cat"} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            {(type === "edit" || type === "care_tip") && (
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Related Breed</label>
                <select className="input-field" value={relatedBreed} onChange={e => setRelatedBreed(e.target.value)}>
                  <option value="">Select a breed…</option>
                  {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Content *</label>
              <textarea
                className="input-field"
                style={{ minHeight: 200, resize: "vertical" }}
                placeholder="Write detailed, accurate information…"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                style={{ fontSize: "0.875rem", color: "var(--mocha)" }}
              />
              {image && <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: "var(--sage)" }}>Selected: {image.name}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.875rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting…" : "Submit for Review →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}