"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "📖",
    title: "Breed Encyclopedia",
    desc: "Detailed profiles of 100+ cat breeds — origins, temperament, lifespan, and care requirements.",
  },
  {
    icon: "❤️",
    title: "Expert Care Tips",
    desc: "Grooming, nutrition, health, and behavioural guidance curated by the community.",
  },
  {
    icon: "✍️",
    title: "Community Contributions",
    desc: "Submit, edit and share knowledge with fellow enthusiasts. Moderated for accuracy.",
  },
];

const styles = {
  hero: {
    minHeight: "88vh",
    display: "flex",
    alignItems: "center",
    position: "relative" as const,
    overflow: "hidden",
    backgroundImage: `
      linear-gradient(rgba(59,47,47,0.85), rgba(59,47,47,0.85)),
      url("/images/hero-cat.jpg")
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "4rem 1.5rem",
    position: "relative" as const,
    zIndex: 1,
  },
  section: {
    padding: "5rem 1.5rem",
  },
};

export default function Dashboard() {
  const { isLoggedIn, isAdmin, token, loading } = useAuth();

  if (loading || (isLoggedIn && !token)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <main style={{ background: "var(--cream)" }}>

      {/* ================= HERO ================= */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <header style={{ maxWidth: 640 }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.3rem 0.8rem",
                marginBottom: "1.5rem",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--amber-light)",
                background: "rgba(196,98,45,0.2)",
                border: "1px solid rgba(196,98,45,0.35)",
              }}
            >
              The Cat Knowledge Platform
            </span>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1.25rem",
              }}
            >
              Everything You Need <br />
              <em style={{ color: "var(--amber-light)" }}>
                to Know About Cats
              </em>
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "1.1rem",
                maxWidth: 480,
                lineHeight: 1.7,
                marginBottom: "2.5rem",
              }}
            >
              Explore breeds, discover care tips, and join a community of feline enthusiasts.
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

              {isAdmin && (
                <Link
                  href="/admin"
                  className="btn-primary"
                  style={{ background: "#f97316" }}
                >
                  Admin Panel →
                </Link>
              )}
            </div>

          </header>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        style={{
          ...styles.section,
          background: "var(--cream-dark)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.2rem",
                color: "var(--espresso)",
              }}
            >
              What Makes the Platform Special
            </h2>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {FEATURES.map((f) => (
              <article key={f.title} className="card" style={{ padding: "2rem" }}>
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                <h3 style={{ marginTop: "0.5rem" }}>{f.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        style={{
          padding: "5rem 1.5rem",
          background: "var(--cream)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.2rem",
              color: "var(--espresso)",
              marginBottom: "1rem",
            }}
          >
            Know Something About Cats?
          </h2>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "rgba(0,0,0,0.65)",
              maxWidth: 600,
              margin: "0 auto 2rem auto",
            }}
          >
            Share your knowledge with the community. Submit breed information, care tips,
            and fun facts to help other cat lovers learn and grow together.
          </p>

          <Link href="/submit" className="btn-primary">
            Submit Cat Info →
          </Link>
        </div>
      </section>

    </main>
  );
}