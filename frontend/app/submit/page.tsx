"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiFormData } from "../lib/api";

interface Breed { id: number; name: string; }

const TEMPERAMENTS = ["calm", "playful", "affectionate", "independent", "social", "energetic"];
const CATEGORIES = ["grooming", "nutrition", "health", "behavior", "exercise"];

export default function SubmitPage() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [type, setType] = useState("breed");

  // Shared
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedBreed, setRelatedBreed] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Breed-specific
  const [origin, setOrigin] = useState("");
  const [temperament, setTemperament] = useState("calm");
  const [lifespan, setLifespan] = useState("");
  const [weight, setWeight] = useState("");
  const [coatLength, setCoatLength] = useState("");
  const [hypoallergenic, setHypoallergenic] = useState(false);
  const [tags, setTags] = useState("");

  // Care tip specific
  const [category, setCategory] = useState("grooming");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.push("/login"); return; }
    loadBreeds();
  }, [token, authLoading]);

  const loadBreeds = async () => {
    try {
      const r = await apiFetch("/breeds/", {}, token);
      if (!r.ok) return;
      const data = await r.json();
      setBreeds(Array.isArray(data) ? data : data.results || []);
    } catch (err) { console.error(err); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setError("Not authenticated yet. Please wait."); return; }
    setError(""); setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("submission_type", type);
      fd.append("title", title);
      fd.append("content", content);
      if (relatedBreed) fd.append("related_breed", relatedBreed);
      if (image) fd.append("image", image);

      if (type === "breed") {
        fd.append("origin", origin);
        fd.append("temperament", temperament);
        fd.append("lifespan", lifespan);
        fd.append("weight", weight);
        fd.append("coat_length", coatLength);
        fd.append("hypoallergenic", String(hypoallergenic));
        if (tags) {
          const arr = tags.split(",").map(t => t.trim()).filter(Boolean);
          fd.append("tags", JSON.stringify(arr));
        }
      }

      if (type === "care_tip") {
        fd.append("category", category);
      }

      const res = await apiFormData("/submissions/create/", fd, token);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Submission failed.");
        return;
      }

      setSuccess(true);
      setTitle(""); setContent(""); setRelatedBreed(""); setImage(null); setImagePreview(null);
      setOrigin(""); setTemperament("calm"); setLifespan(""); setWeight("");
      setCoatLength(""); setHypoallergenic(false); setTags(""); setCategory("grooming");
      setType("breed");
      setTimeout(() => setSuccess(false), 4000);
    } catch { setError("Unable to connect."); }
    finally { setSubmitting(false); }
  };

  const typeLabels: Record<string, { icon: string; label: string; desc: string }> = {
    breed: { icon: "🐱", label: "New Breed", desc: "Submit a breed not yet in the encyclopedia" },
    edit: { icon: "✏️", label: "Edit Breed", desc: "Suggest corrections to an existing breed" },
    care_tip: { icon: "💡", label: "Care Tip", desc: "Share grooming, health or nutrition advice" },
  };

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "var(--espresso)", marginBottom: "0.4rem" }}>
            Share Your Knowledge
          </h1>
          <p style={{ color: "var(--mocha)", opacity: 0.6 }}>
            Contribute to the encyclopedia — admins review before publishing.
          </p>
        </div>

        {success && (
          <div style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#16a34a", padding: "1rem 1.25rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ✅ Submitted successfully! Your contribution is awaiting admin review.
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "1rem 1.25rem", borderRadius: 4, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* TYPE SELECTOR */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.25rem" }}>
            <p style={sectionLabel}>Submission Type</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "0.75rem" }}>
              {Object.entries(typeLabels).map(([val, { icon, label, desc }]) => (
                <button key={val} type="button" onClick={() => setType(val)}
                  style={{
                    padding: "0.85rem 0.75rem", border: `2px solid ${type === val ? "var(--terracotta)" : "var(--border)"}`,
                    borderRadius: 4, cursor: "pointer", textAlign: "left",
                    background: type === val ? "rgba(196,98,45,0.06)" : "white",
                    transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>{icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: type === val ? "var(--terracotta)" : "var(--espresso)", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--mocha)", opacity: 0.6, lineHeight: 1.4 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN FORM CARD */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* ── BREED FORM ── */}
            {type === "breed" && (
              <>
                <p style={sectionLabel}>Basic Information</p>

                {/* Name + Origin */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Breed Name *">
                    <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Maine Coon" />
                  </Field>
                  <Field label="Origin">
                    <input className="input-field" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. United States" />
                  </Field>
                </div>

                {/* Description */}
                <Field label="Description *">
                  <textarea className="input-field" style={{ minHeight: 130, resize: "vertical" }} value={content} onChange={e => setContent(e.target.value)} required placeholder="Describe the breed's appearance, personality, and history…" />
                </Field>

                {/* Temperament */}
                <Field label="Temperament">
                  <select className="input-field" value={temperament} onChange={e => setTemperament(e.target.value)}>
                    {TEMPERAMENTS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </Field>

                {/* Lifespan + Weight */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Lifespan">
                    <input className="input-field" value={lifespan} onChange={e => setLifespan(e.target.value)} placeholder="e.g. 12–17 years" />
                  </Field>
                  <Field label="Weight">
                    <input className="input-field" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 3–5.5 kg" />
                  </Field>
                </div>

                {/* Coat Length + Hypoallergenic */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "end" }}>
                  <Field label="Coat Length">
                    <input className="input-field" value={coatLength} onChange={e => setCoatLength(e.target.value)} placeholder="e.g. Long (thick double coat)" />
                  </Field>
                  <div style={{ paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <input type="checkbox" id="sub-hypo" checked={hypoallergenic} onChange={e => setHypoallergenic(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                    <label htmlFor="sub-hypo" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--espresso)", cursor: "pointer" }}>Hypoallergenic</label>
                  </div>
                </div>

                {/* Tags */}
                <Field label="Tags" hint='Comma-separated e.g. fluffy, indoor, gentle'>
                  <input className="input-field" value={tags} onChange={e => setTags(e.target.value)} placeholder="fluffy, indoor, gentle" />
                </Field>

                {/* Image */}
                <Field label="Image">
                  {imagePreview && (
                    <div style={{ width: "100%", height: 200, borderRadius: 4, overflow: "hidden", marginBottom: "0.75rem", border: "1px solid var(--border)" }}>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <input
                    type="file" accept="image/*"
                    style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: 4, background: "white", fontSize: "0.875rem", cursor: "pointer" }}
                    onChange={handleImageChange}
                  />
                  {image && <p style={{ fontSize: "0.75rem", color: "var(--mocha)", opacity: 0.5, marginTop: "0.3rem" }}>{image.name}</p>}
                </Field>
              </>
            )}

            {/* ── EDIT FORM ── */}
            {type === "edit" && (
              <>
                <p style={sectionLabel}>Breed to Edit</p>

                <Field label="Related Breed *">
                  <select className="input-field" value={relatedBreed} onChange={e => setRelatedBreed(e.target.value)} required>
                    <option value="">— select a breed —</option>
                    {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>

                <Field label="Edit Title *">
                  <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Brief description of your edit" />
                </Field>

                <Field label="Updated Content *">
                  <textarea className="input-field" style={{ minHeight: 150, resize: "vertical" }} value={content} onChange={e => setContent(e.target.value)} required placeholder="Provide the corrected or updated information…" />
                </Field>

                {/* Image */}
                <Field label="Image" hint="Upload a new image to replace the existing one (optional)">
                  {imagePreview && (
                    <div style={{ width: "100%", height: 200, borderRadius: 4, overflow: "hidden", marginBottom: "0.75rem", border: "1px solid var(--border)" }}>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <input
                    type="file" accept="image/*"
                    style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: 4, background: "white", fontSize: "0.875rem", cursor: "pointer" }}
                    onChange={handleImageChange}
                  />
                  {image && <p style={{ fontSize: "0.75rem", color: "var(--mocha)", opacity: 0.5, marginTop: "0.3rem" }}>{image.name}</p>}
                </Field>
              </>
            )}

            {/* ── CARE TIP FORM ── */}
            {type === "care_tip" && (
              <>
                <p style={sectionLabel}>Care Tip Details</p>

                {/* Related Breed + Category */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Related Breed">
                    <select className="input-field" value={relatedBreed} onChange={e => setRelatedBreed(e.target.value)}>
                      <option value="">General (all breeds)</option>
                      {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Category *">
                    <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} required>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Tip Title */}
                <Field label="Tip Title *">
                  <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Brushing a Persian's long coat" />
                </Field>

                {/* Tip Content */}
                <Field label="Tip Content *" hint="Be specific and practical — step-by-step advice works best">
                  <textarea
                    className="input-field"
                    style={{ minHeight: 160, resize: "vertical" }}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    placeholder={`Share detailed, practical advice. For example:\n• How often to do it\n• What tools to use\n• Common mistakes to avoid`}
                  />
                </Field>

                {/* Image */}
                <Field label="Image" hint="Optional — a photo can make the tip easier to follow">
                  {imagePreview && (
                    <div style={{ width: "100%", height: 200, borderRadius: 4, overflow: "hidden", marginBottom: "0.75rem", border: "1px solid var(--border)" }}>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <input
                    type="file" accept="image/*"
                    style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: 4, background: "white", fontSize: "0.875rem", cursor: "pointer" }}
                    onChange={handleImageChange}
                  />
                  {image && <p style={{ fontSize: "0.75rem", color: "var(--mocha)", opacity: 0.5, marginTop: "0.3rem" }}>{image.name}</p>}
                </Field>
              </>
            )}
          </div>

          {/* SUBMIT */}
          <button className="btn-primary" disabled={submitting} style={{ alignSelf: "flex-end", padding: "0.75rem 2rem", fontSize: "0.95rem" }}>
            {submitting ? "Submitting…" : "Submit for Review →"}
          </button>

        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--espresso)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: "0.72rem", color: "var(--mocha)", opacity: 0.5, margin: 0 }}>{hint}</p>}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "var(--mocha)", opacity: 0.5,
};