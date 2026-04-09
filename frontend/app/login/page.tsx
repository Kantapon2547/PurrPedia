"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/users/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); return; }
      login(data.user, data.access, data.refresh);
      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--cream)", display: "flex" }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: "var(--espresso)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem", minWidth: 0 }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
            Welcome<br /><em style={{ color: "var(--amber-light)" }}>back.</em>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Sign in to access your favorites, submit cat knowledge, and connect with the community.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", minWidth: 0 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 600, color: "var(--espresso)", marginBottom: "0.5rem" }}>Sign In</div>
          <p style={{ color: "var(--mocha)", opacity: 0.6, marginBottom: "2rem", fontSize: "0.9rem" }}>
            Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--terracotta)", fontWeight: 500 }}>Sign up free</Link>
          </p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 2, marginBottom: "1.25rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Username</label>
              <input className="input-field" type="text" placeholder="your_username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--mocha)", marginBottom: "0.4rem" }}>Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem", padding: "0.875rem", width: "100%", fontSize: "0.875rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}