"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiFormData } from "../lib/api";

interface Submission { id: number; title: string; submission_type: string; status: string; submitted_by: string; created_at: string; content: string; }
interface Breed { id: number; name: string; origin: string; temperament: string; hypoallergenic: boolean; }
interface AppUser { id: number; username: string; email: string; role: string; date_joined: string; }

type Tab = "submissions" | "breeds" | "users";

export default function AdminPage() {
  const { token, isAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  // New breed form
  const [nb, setNb] = useState({ name: "", origin: "", description: "", temperament: "", lifespan: "", weight: "", coat_length: "", hypoallergenic: false, tags: "" });
  const [nbImage, setNbImage] = useState<File | null>(null);
  const [nbMsg, setNbMsg] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!isAdmin) { router.push("/dashboard"); return; }
    loadTab(tab);
  }, [isAdmin, isLoggedIn]);

  const loadTab = async (t: Tab) => {
    setTab(t); setLoading(true);
    if (t === "submissions") {
      const r = await apiFetch("/submissions/", {}, token);
      setSubmissions(await r.json());
    } else if (t === "breeds") {
      const r = await apiFetch("/breeds/", {}, token);
      setBreeds(await r.json());
    } else if (t === "users") {
      const r = await apiFetch("/users/", {}, token);
      setUsers(await r.json());
    }
    setLoading(false);
  };

  const reviewSubmission = async (id: number, status: "approved" | "rejected") => {
    await apiFetch(`/submissions/${id}/review/`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const deleteBreed = async (id: number) => {
    if (!confirm("Delete this breed?")) return;
    await apiFetch(`/breeds/${id}/`, { method: "DELETE" }, token);
    setBreeds(prev => prev.filter(b => b.id !== id));
  };

  const changeRole = async (userId: number, role: string) => {
    await apiFetch(`/users/${userId}/role/`, { method: "PATCH", body: JSON.stringify({ role }) }, token);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const createBreed = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(nb).forEach(([k, v]) => {
      if (k === "tags") fd.append(k, JSON.stringify(v ? (v as string).split(",").map(t => t.trim()) : []));
      else fd.append(k, String(v));
    });
    if (nbImage) fd.append("image", nbImage);
    const r = await apiFormData("/breeds/", fd, token);
    if (r.ok) { setNbMsg("✅ Breed created!"); setNb({ name: "", origin: "", description: "", temperament: "", lifespan: "", weight: "", coat_length: "", hypoallergenic: false, tags: "" }); setNbImage(null); loadTab("breeds"); }
    else { const d = await r.json(); setNbMsg(d.error || "Failed."); }
    setTimeout(() => setNbMsg(""), 3000);
  };

  const tabStyle = (t: Tab) => ({
    padding: "0.6rem 1.5rem", cursor: "pointer", border: "none", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.04em", textTransform: "uppercase" as const,
    background: tab === t ? "var(--espresso)" : "transparent",
    color: tab === t ? "white" : "var(--mocha)",
    borderBottom: tab === t ? "2px solid var(--terracotta)" : "2px solid transparent",
  });

  const statusColor: Record<string, string> = { pending: "#d97706", approved: "#16a34a", rejected: "#dc2626" };

  return (
    <div style={{ background: "var(--cream)", minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ background: "var(--espresso)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "white" }}>Admin Dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "0.25rem", fontSize: "0.9rem" }}>Manage content, submissions and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          <button onClick={() => loadTab("submissions")} style={tabStyle("submissions")}>Submissions</button>
          <button onClick={() => loadTab("breeds")} style={tabStyle("breeds")}>Breeds</button>
          <button onClick={() => loadTab("users")} style={tabStyle("users")}>Users</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {loading && <div style={{ textAlign: "center", padding: "3rem", color: "var(--mocha)", opacity: 0.5 }}>Loading…</div>}

        {/* SUBMISSIONS */}
        {tab === "submissions" && !loading && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", marginBottom: "1.5rem" }}>
              Pending Submissions <span style={{ fontSize: "0.9rem", color: "var(--terracotta)" }}>({submissions.filter(s => s.status === "pending").length})</span>
            </h2>
            {submissions.length === 0 ? <p style={{ color: "var(--mocha)", opacity: 0.5 }}>No submissions yet.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {submissions.map(s => (
                  <div key={s.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontWeight: 600, color: "var(--espresso)", marginBottom: 2 }}>{s.title}</h3>
                        <div style={{ fontSize: "0.78rem", color: "var(--mocha)", opacity: 0.5 }}>
                          by {s.submitted_by} · {s.submission_type.replace("_", " ")} · {new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColor[s.status], textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.status}</span>
                        {s.status === "pending" && (
                          <>
                            <button onClick={() => reviewSubmission(s.id, "approved")} style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", padding: "0.3rem 0.8rem", borderRadius: 2, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Approve</button>
                            <button onClick={() => reviewSubmission(s.id, "rejected")} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "0.3rem 0.8rem", borderRadius: 2, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                    <p style={{ color: "var(--mocha)", fontSize: "0.875rem", lineHeight: 1.6, maxHeight: 80, overflow: "hidden" }}>{s.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BREEDS */}
        {tab === "breeds" && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", marginBottom: "1.5rem" }}>All Breeds ({breeds.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {breeds.map(b => (
                  <div key={b.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--espresso)" }}>{b.name}</span>
                      <span style={{ color: "var(--mocha)", opacity: 0.5, fontSize: "0.82rem", marginLeft: 10 }}>{b.origin} · {b.temperament}</span>
                    </div>
                    <button onClick={() => deleteBreed(b.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Breed */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.75rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginBottom: "1.25rem" }}>Add New Breed</h3>
              {nbMsg && <div style={{ fontSize: "0.85rem", marginBottom: "1rem", color: nbMsg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{nbMsg}</div>}
              <form onSubmit={createBreed} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {[["Name *", "name", "text"], ["Origin", "origin", "text"], ["Lifespan", "lifespan", "text"], ["Weight", "weight", "text"], ["Coat Length", "coat_length", "text"], ["Tags (comma-separated)", "tags", "text"]].map(([lbl, key, type]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.3rem" }}>{lbl}</label>
                    <input className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} type={type} required={key === "name"} value={(nb as Record<string, string | boolean>)[key] as string} onChange={e => setNb(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.3rem" }}>Temperament</label>
                  <select className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} value={nb.temperament} onChange={e => setNb(p => ({ ...p, temperament: e.target.value }))}>
                    <option value="">Select…</option>
                    {["calm", "playful", "affectionate", "independent", "social", "energetic"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.3rem" }}>Description *</label>
                  <textarea className="input-field" style={{ fontSize: "0.85rem", minHeight: 80, resize: "vertical" }} required value={nb.description} onChange={e => setNb(p => ({ ...p, description: e.target.value }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={nb.hypoallergenic} onChange={e => setNb(p => ({ ...p, hypoallergenic: e.target.checked }))} />
                  Hypoallergenic
                </label>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.3rem" }}>Image</label>
                  <input type="file" accept="image/*" onChange={e => setNbImage(e.target.files?.[0] || null)} style={{ fontSize: "0.82rem" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "0.65rem", fontSize: "0.85rem", marginTop: "0.25rem" }}>Add Breed</button>
              </form>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && !loading && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", marginBottom: "1.5rem" }}>All Users ({users.length})</h2>
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "var(--cream-dark)", borderBottom: "1px solid var(--border)" }}>
                    {["Username", "Email", "Role", "Joined", "Actions"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--mocha)", opacity: 0.6 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "0.875rem 1.25rem", fontWeight: 500, color: "var(--espresso)" }}>{u.username}</td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--mocha)", opacity: 0.7 }}>{u.email || "—"}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <span className={`badge ${u.role === "admin" ? "badge-amber" : "badge-dust"}`} style={{ textTransform: "capitalize" }}>{u.role}</span>
                      </td>
                      <td style={{ padding: "0.875rem 1.25rem", color: "var(--mocha)", opacity: 0.6, fontSize: "0.8rem" }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td style={{ padding: "0.875rem 1.25rem" }}>
                        <button onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontWeight: 500, fontSize: "0.82rem" }}>
                          Make {u.role === "admin" ? "User" : "Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}