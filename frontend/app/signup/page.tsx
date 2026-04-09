"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const PREFERENCES = ["calm", "playful", "affectionate", "independent", "social", "energetic"];

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prefs, setPrefs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const togglePref = (p: string) => setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/users/signup/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      login(data.user, data.access, data.refresh);

      // Save preferences
      if (prefs.length > 0) {
        await apiFetch("/users/profile/", {
          method: "PATCH",
          body: JSON.stringify({ preferences: prefs }),
        }, data.access);
      }
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 500, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "3rem 2.5rem" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.4rem" }}>Create Account</div>
        <p style={{ color: "var(--mocha)", opacity: 0.6, marginBottom: "2rem", fontSize: "0.9rem" }}>
          Already have one? <Link href="/login" style={{ color: "var(--terracotta)", fontWeight: 500 }}>Sign in</Link>
        </p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 2, marginBottom: "1.25rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Username *</label>
            <input className="input-field" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Password *</label>
            <input className="input-field" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {/* Preferences */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.75rem" }}>
              Cat Temperament Preferences <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {PREFERENCES.map(p => (
                <button key={p} type="button" onClick={() => togglePref(p)} style={{
                  padding: "0.35rem 0.9rem", borderRadius: 2, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  background: prefs.includes(p) ? "var(--terracotta)" : "transparent",
                  color: prefs.includes(p) ? "white" : "var(--mocha)",
                  border: `1.5px solid ${prefs.includes(p) ? "var(--terracotta)" : "var(--border)"}`,
                  textTransform: "capitalize",
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.875rem", width: "100%", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}