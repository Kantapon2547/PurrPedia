"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface Fav { id: number; name: string; image: string | null; }
interface ProfileData { username: string; email: string; bio: string; role: string; preferences: string[]; favorites: Fav[]; }

const ALL_PREFS = ["calm", "playful", "affectionate", "independent", "social", "energetic"];

export default function ProfilePage() {
  const { token, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    apiFetch("/users/profile/", {}, token).then(r => r.json()).then(d => {
      setProfile(d); setBio(d.bio); setEmail(d.email); setPrefs(d.preferences);
    });
  }, [isLoggedIn]);

  const togglePref = (p: string) => setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await apiFetch("/users/profile/", { method: "PATCH", body: JSON.stringify({ bio, email, preferences: prefs }) }, token);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!profile) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--mocha)" }}>Loading…</div>;

  return (
    <div style={{ background: "var(--cream)", minHeight: "calc(100vh - 64px)", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", color: "var(--espresso)", marginBottom: "2.5rem" }}>
          My Profile
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Edit form */}
          <form onSubmit={handleSave} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--espresso)" }}>Account Details</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Username</label>
                <input className="input-field" type="text" value={profile.username} disabled style={{ opacity: 0.5 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Bio</label>
                <textarea className="input-field" style={{ minHeight: 100, resize: "vertical" }} placeholder="Tell us about yourself…" value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.75rem" }}>Preferences</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {ALL_PREFS.map(p => (
                    <button key={p} type="button" onClick={() => togglePref(p)} style={{
                      padding: "0.3rem 0.8rem", borderRadius: 2, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
                      background: prefs.includes(p) ? "var(--terracotta)" : "transparent",
                      color: prefs.includes(p) ? "white" : "var(--mocha)",
                      border: `1.5px solid ${prefs.includes(p) ? "var(--terracotta)" : "var(--border)"}`,
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "0.75rem", opacity: saving ? 0.7 : 1 }}>
                {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Favorites */}
          <div>
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginBottom: "1.25rem", color: "var(--espresso)" }}>
                ❤️ Saved Breeds
              </h2>
              {profile.favorites.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <p style={{ color: "var(--mocha)", opacity: 0.5, marginBottom: "1rem", fontSize: "0.9rem" }}>No favorites yet.</p>
                  <Link href="/breeds" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1.25rem" }}>Browse Breeds</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {profile.favorites.map(f => (
                    <Link key={f.id} href={`/breeds/${f.id}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 2, textDecoration: "none" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 2, overflow: "hidden", background: "var(--cream-dark)", flexShrink: 0 }}>
                        {f.image ? <img src={`http://127.0.0.1:8000${f.image}`} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🐱</div>}
                      </div>
                      <span style={{ fontWeight: 500, color: "var(--espresso)", fontSize: "0.9rem" }}>{f.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: "1rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "1.25rem 2rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--mocha)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role</div>
              <div style={{ fontWeight: 600, color: "var(--espresso)", textTransform: "capitalize" }}>{profile.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}