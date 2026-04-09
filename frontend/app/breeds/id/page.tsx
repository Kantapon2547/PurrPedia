"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface CareTip { id: number; title: string; content: string; category: string; }
interface Breed {
  id: number; name: string; origin: string; description: string; temperament: string;
  lifespan: string; weight: string; coat_length: string; hypoallergenic: boolean;
  image: string | null; tags: string[]; care_tips: CareTip[]; favorited: boolean;
}

const categoryColors: Record<string, string> = {
  grooming: "badge-amber", nutrition: "badge-sage", health: "badge-dust",
  behavior: "badge-amber", exercise: "badge-sage",
};

export default function BreedDetailPage() {
  const { id } = useParams();
  const { token, isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();
  const [breed, setBreed] = useState<Breed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/breeds/${id}/`, {}, token).then(r => r.json()).then(d => { setBreed(d); setLoading(false); });
  }, [id]);

  const toggleFav = async () => {
    if (!isLoggedIn || !breed) return;
    const res = await apiFetch(`/users/favorite/${breed.id}/`, { method: "POST" }, token);
    if (res.ok) {
      const d = await res.json();
      setBreed(prev => prev ? { ...prev, favorited: d.favorited } : prev);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this breed?")) return;
    await apiFetch(`/breeds/${id}/`, { method: "DELETE" }, token);
    router.push("/breeds");
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--mocha)" }}>Loading…</div>;
  if (!breed) return <div style={{ padding: "4rem", textAlign: "center" }}>Breed not found.</div>;

  return (
    <div style={{ background: "var(--cream)", minHeight: "calc(100vh - 64px)" }}>
      {/* Hero */}
      <div style={{ background: "var(--espresso)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem", display: "flex", gap: "3rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Image */}
          <div style={{ width: 260, height: 260, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: "var(--mocha)", border: "3px solid rgba(255,255,255,0.1)" }}>
            {breed.image ? (
              <img src={`http://127.0.0.1:8000${breed.image}`} alt={breed.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>🐱</div>
            )}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {breed.temperament && <span className="badge" style={{ background: "rgba(196,98,45,0.25)", color: "var(--amber-light)", border: "1px solid rgba(196,98,45,0.3)", textTransform: "capitalize" }}>{breed.temperament}</span>}
              {breed.hypoallergenic && <span className="badge" style={{ background: "rgba(122,158,126,0.2)", color: "#a8d8ac", border: "1px solid rgba(122,158,126,0.3)" }}>Hypoallergenic</span>}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.75rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{breed.name}</h1>
            {breed.origin && <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>📍 {breed.origin}</p>}

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {breed.lifespan && <div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Lifespan</div><div style={{ color: "white", fontWeight: 500 }}>{breed.lifespan}</div></div>}
              {breed.weight && <div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Weight</div><div style={{ color: "white", fontWeight: 500 }}>{breed.weight}</div></div>}
              {breed.coat_length && <div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Coat</div><div style={{ color: "white", fontWeight: 500 }}>{breed.coat_length}</div></div>}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {isLoggedIn && (
                <button onClick={toggleFav} className="btn-ghost" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white", padding: "0.5rem 1.25rem", fontSize: "0.8rem" }}>
                  {breed.favorited ? "❤️ Saved" : "🤍 Save"}
                </button>
              )}
              {isAdmin && (
                <>
                  <Link href={`/admin?edit=${breed.id}`} className="btn-ghost" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white", padding: "0.5rem 1.25rem", fontSize: "0.8rem" }}>Edit</Link>
                  <button onClick={handleDelete} style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5", padding: "0.5rem 1.25rem", borderRadius: 2, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: "1rem", color: "var(--espresso)" }}>About the Breed</h2>
          <p style={{ color: "var(--mocha)", lineHeight: 1.8, marginBottom: "2.5rem" }}>{breed.description}</p>

          {breed.tags?.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--mocha)", opacity: 0.5, marginBottom: "0.75rem" }}>Tags</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {breed.tags.map((t, i) => <span key={i} className="badge badge-dust">{t}</span>)}
              </div>
            </div>
          )}

          {/* Care Tips */}
          {breed.care_tips?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: "1.5rem", color: "var(--espresso)" }}>Care Tips</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {breed.care_tips.map(tip => (
                  <div key={tip.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontWeight: 600, color: "var(--espresso)" }}>{tip.title}</h4>
                      <span className={`badge ${categoryColors[tip.category] || "badge-dust"}`} style={{ marginLeft: 8, flexShrink: 0, textTransform: "capitalize" }}>{tip.category}</span>
                    </div>
                    <p style={{ color: "var(--mocha)", fontSize: "0.9rem", lineHeight: 1.7 }}>{tip.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--espresso)" }}>Quick Facts</h3>
            {[
              ["Origin", breed.origin],
              ["Temperament", breed.temperament],
              ["Lifespan", breed.lifespan],
              ["Weight", breed.weight],
              ["Coat Length", breed.coat_length],
              ["Hypoallergenic", breed.hypoallergenic ? "Yes" : "No"],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--mocha)", opacity: 0.6, fontWeight: 500 }}>{k}</span>
                <span style={{ color: "var(--espresso)", textAlign: "right", textTransform: "capitalize" }}>{v as string}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/breeds" style={{ color: "var(--terracotta)", fontWeight: 500, fontSize: "0.85rem", textDecoration: "none" }}>← Back to all breeds</Link>
          </div>
        </div>
      </div>
    </div>
  );
}