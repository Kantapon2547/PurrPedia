"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function EditSubmissionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    submission_type: "",

    origin: "",
    temperament: "",
    lifespan: "",
    weight: "",
    coat_length: "",

    hypoallergenic: false,
    tags: [] as string[],
  });

  const [image, setImage] = useState<string | null>(null);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch(`/submissions/${id}/`, {});

        if (!res.ok) {
          setError(`Failed to load (${res.status})`);
          return;
        }

        const data = await res.json();

        setForm({
          title: data.title || "",
          content: data.content || "",
          submission_type: data.submission_type || "",

          origin: data.origin || "",
          temperament: data.temperament || "",
          lifespan: data.lifespan || "",
          weight: data.weight || "",
          coat_length: data.coat_length || "",

          hypoallergenic: data.hypoallergenic || false,
          tags: data.tags || [],
        });

        if (data.image) setImage(data.image);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---------------- TAGS ----------------
  const handleTags = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tags: value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }));
  };

  // ---------------- SAVE ----------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await apiFetch(`/submissions/${id}/edit/`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || `Save failed (${res.status})`);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/admin/submissions/${id}`);
      }, 600);
    } catch {
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- UI STATES ----------------
  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        <p>{error}</p>
        <button onClick={() => router.back()}>Go back</button>
      </div>
    );
  }

  return (
    <div style={container}>
      <h1 style={{ marginBottom: "1.5rem" }}>Edit Submission</h1>

      <form onSubmit={handleSave} style={formStyle}>
        {/* TITLE */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          style={input}
        />

        {/* TYPE */}
        <input
          name="submission_type"
          value={form.submission_type}
          onChange={handleChange}
          placeholder="Submission Type"
          style={input}
        />

        {/* CONTENT */}
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          rows={6}
          style={input}
        />

        {/* BREED FIELDS */}
        <input
          name="origin"
          value={form.origin}
          onChange={handleChange}
          placeholder="Origin"
          style={input}
        />

        <input
          name="temperament"
          value={form.temperament}
          onChange={handleChange}
          placeholder="Temperament"
          style={input}
        />

        <input
          name="lifespan"
          value={form.lifespan}
          onChange={handleChange}
          placeholder="Lifespan"
          style={input}
        />

        <input
          name="weight"
          value={form.weight}
          onChange={handleChange}
          placeholder="Weight"
          style={input}
        />

        <input
          name="coat_length"
          value={form.coat_length}
          onChange={handleChange}
          placeholder="Coat Length"
          style={input}
        />

        {/* CHECKBOX */}
        <label style={{ fontSize: "0.9rem" }}>
          <input
            type="checkbox"
            name="hypoallergenic"
            checked={form.hypoallergenic}
            onChange={handleChange}
          />
          {" "}Hypoallergenic
        </label>

        {/* TAGS */}
        <input
          value={form.tags.join(", ")}
          onChange={(e) => handleTags(e.target.value)}
          placeholder="Tags (comma separated)"
          style={input}
        />

        {/* IMAGE */}
        {image && (
          <img
            src={image}
            alt="submission"
            style={{
              width: 200,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        )}

        {/* STATUS */}
        {success && (
          <p style={{ color: "green" }}>Saved successfully ✔</p>
        )}

        {/* BUTTON */}
        <button type="submit" disabled={saving} style={button}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const container: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "2rem",
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const input: React.CSSProperties = {
  padding: "0.75rem",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: "0.9rem",
};

const button: React.CSSProperties = {
  padding: "0.75rem",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};