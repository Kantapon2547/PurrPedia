"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiFormData } from "../lib/api";

interface Breed {
  id: number;
  name: string;
}

export default function SubmitPage() {
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [type, setType] = useState("breed");

  // Shared fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedBreed, setRelatedBreed] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Breed-specific fields (matches Django admin)
  const [origin, setOrigin] = useState("");
  const [temperament, setTemperament] = useState("calm");
  const [lifespan, setLifespan] = useState("");
  const [weight, setWeight] = useState("");
  const [coatLength, setCoatLength] = useState("");
  const [hypoallergenic, setHypoallergenic] = useState(false);
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!token) return;
    loadBreeds();
  }, [isLoggedIn, token]);

  const loadBreeds = async () => {
    try {
      const r = await apiFetch("/breeds/", {}, token);
      const data = await r.json();
      setBreeds(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load breeds:", err);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("submission_type", type);
      fd.append("title", title);
      fd.append("content", content);

      if (relatedBreed) fd.append("related_breed", relatedBreed);
      if (image) fd.append("image", image);

      // Append breed-specific fields only when type === "breed"
      if (type === "breed") {
        fd.append("origin", origin);
        fd.append("temperament", temperament);
        fd.append("lifespan", lifespan);
        fd.append("weight", weight);
        fd.append("coat_length", coatLength);
        fd.append("hypoallergenic", String(hypoallergenic));
        if (tags) fd.append("tags", tags);
      }

      const res = await apiFormData("/submissions/", fd, token);

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Submission failed.");
        return;
      }

      setSuccess(true);
      setTitle(""); setContent(""); setRelatedBreed(""); setImage(null);
      setOrigin(""); setTemperament("calm"); setLifespan("");
      setWeight(""); setCoatLength(""); setHypoallergenic(false); setTags("");
      setType("breed");
      setTimeout(() => setSuccess(false), 3000);

    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem" }}>
            Share Your Knowledge
          </h1>
          <p style={{ color: "var(--mocha)", opacity: 0.7 }}>
            Submit content — admins will review before publishing.
          </p>
        </div>

        {success && <div style={successBox}>✅ Submitted! Waiting for admin approval.</div>}
        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={cardStyle}>

          {/* SUBMISSION TYPE */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={label}>Submission Type</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["breed", "edit", "care_tip"].map(val => (
                <button key={val} type="button" onClick={() => setType(val)}
                  style={{ ...pillBtn, background: type === val ? "#c4622d" : "transparent", color: type === val ? "white" : "#444" }}>
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* TITLE / NAME */}
          <div>
            <label style={label}>{type === "breed" ? "Breed Name *" : "Title *"}</label>
            <input className="input-field" value={title}
              onChange={e => setTitle(e.target.value)} required />
          </div>

          {/* BREED-SPECIFIC FIELDS */}
          {type === "breed" && (
            <>
              <div>
                <label style={label}>Origin</label>
                <input className="input-field" placeholder="e.g. Persia (modern-day Iran)"
                  value={origin} onChange={e => setOrigin(e.target.value)} />
              </div>

              <div>
                <label style={label}>Description *</label>
                <textarea className="input-field" style={{ minHeight: 150 }}
                  value={content} onChange={e => setContent(e.target.value)} required />
              </div>

              <div>
                <label style={label}>Temperament</label>
                <select className="input-field" value={temperament}
                  onChange={e => setTemperament(e.target.value)}>
                  <option value="calm">Calm</option>
                  <option value="playful">Playful</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="affectionate">Affectionate</option>
                  <option value="independent">Independent</option>
                  <option value="vocal">Vocal</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={label}>Lifespan</label>
                  <input className="input-field" placeholder="e.g. 12–17 years"
                    value={lifespan} onChange={e => setLifespan(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Weight</label>
                  <input className="input-field" placeholder="e.g. 3–5.5 kg (7–12 lbs)"
                    value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={label}>Coat Length</label>
                <input className="input-field" placeholder="e.g. Long (thick, luxurious double)"
                  value={coatLength} onChange={e => setCoatLength(e.target.value)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" id="hypo" checked={hypoallergenic}
                  onChange={e => setHypoallergenic(e.target.checked)} />
                <label htmlFor="hypo" style={{ ...label, marginBottom: 0 }}>Hypoallergenic</label>
              </div>

              <div>
                <label style={label}>Tags</label>
                <input className="input-field" placeholder='e.g. ["fluffy","indoor"]'
                  value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </>
          )}

          {/* EDIT / CARE_TIP FIELDS */}
          {type !== "breed" && (
            <>
              <div>
                <label style={label}>Related Breed</label>
                <select className="input-field" value={relatedBreed}
                  onChange={e => setRelatedBreed(e.target.value)}>
                  <option value="">Select…</option>
                  {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label style={label}>Content *</label>
                <textarea className="input-field" style={{ minHeight: 150 }}
                  value={content} onChange={e => setContent(e.target.value)} required />
              </div>
            </>
          )}

          {/* IMAGE */}
          <div>
            <label style={label}>Image</label>
            <input type="file" accept="image/*"
              onChange={e => setImage(e.target.files?.[0] || null)} />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit →"}
          </button>

        </form>
      </div>
    </div>
  );
}

/* styles — unchanged from original */
const cardStyle = { background: "white", padding: "2rem", borderRadius: 8, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column" as const, gap: "1rem" };
const label = { fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" };
const pillBtn = { padding: "0.4rem 1rem", border: "1px solid #ddd", borderRadius: 20, cursor: "pointer" };
const successBox = { background: "#ecfdf5", padding: "1rem", marginBottom: "1rem", border: "1px solid #bbf7d0", color: "#16a34a" };
const errorBox = { background: "#fef2f2", padding: "1rem", marginBottom: "1rem", border: "1px solid #fecaca", color: "#dc2626" };