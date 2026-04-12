"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "📖", title: "Breed Encyclopedia", desc: "Detailed profiles of 100+ cat breeds — origins, temperament, lifespan, and care requirements." },
  { icon: "❤️", title: "Expert Care Tips", desc: "Grooming, nutrition, health, and behavioural guidance curated by the community." },
  { icon: "✍️", title: "Community Contributions", desc: "Submit, edit and share knowledge with fellow enthusiasts. Moderated for accuracy." },
];

const stats = [
  { label: "Cat Breeds", value: "100+" },
  { label: "Care Articles", value: "500+" },
  { label: "Contributors", value: "2k+" },
];

export default function Dashboard() {
  const { isLoggedIn, isAdmin, token } = useAuth();

  // ✅ Prevent render before auth is ready
  if (isLoggedIn && !token) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: "var(--cream)" }}>

      {/* HERO */}
      <section style={{
        minHeight: "88vh",
        background: "linear-gradient(135deg, var(--espresso) 0%, var(--mocha) 60%, #5a3a28 100%)",
        display: "flex", alignItems: "center", position: "relative", overflow: "hidden",
      }}>

        {/* Decorative */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "40%", width: 400, height: 400, borderRadius: "50%", background: "rgba(196,98,45,0.08)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.5rem", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 640 }}>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(196,98,45,0.2)",
              border: "1px solid rgba(196,98,45,0.35)",
              borderRadius: 2,
              padding: "0.3rem 0.8rem",
              marginBottom: "1.5rem"
            }}>
              <span style={{
                fontSize: "0.75rem",
                color: "var(--amber-light)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}>
                The Cat Knowledge Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              marginBottom: "1.25rem"
            }}>
              Everything You Need<br />
              <em style={{ color: "var(--amber-light)", fontStyle: "italic" }}>
                to Know About Cats
              </em>
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "1.1rem",
              marginBottom: "2.5rem",
              maxWidth: 480,
              lineHeight: 1.7
            }}>
              Explore breeds, discover care tips, and join a community of dedicated feline enthusiasts.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/breeds" className="btn-primary">
                Browse Breeds →
              </Link>

              {!isLoggedIn && (
                <Link href="/signup" className="btn-ghost">
                  Join the Community
                </Link>
              )}

              {/* ✅ ADMIN BUTTON */}
              {isAdmin && (
                <Link href="/admin" className="btn-primary" style={{ background: "#f97316" }}>
                  Go to Admin →
                </Link>
              )}
            </div>

            {/* STATS */}
            <div style={{
              display: "flex",
              gap: "2.5rem",
              marginTop: "3.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.1)"
            }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "var(--amber-light)"
                  }}>
                    {s.value}
                  </div>
                  <div style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase"
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--cream-dark)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.2rem",
              color: "var(--espresso)"
            }}>
              What Makes PurrPedia Special
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem"
          }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: "2rem" }}>
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ opacity: 0.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section style={{
          padding: "5rem 1.5rem",
          background: "var(--espresso)",
          textAlign: "center"
        }}>
          <h2 style={{ color: "white" }}>Ready to contribute?</h2>
          <Link href="/signup" className="btn-primary">
            Create Free Account
          </Link>
        </section>
      )}

    </div>
  );
}