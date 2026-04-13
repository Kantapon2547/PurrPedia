"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Breed {
  id: number;
  name: string;
  origin: string;
  temperament: string;
  lifespan: string;
  hypoallergenic: boolean;
  image: string | null;
  tags: string[];
  favorited: boolean;
}

const TEMPERAMENTS = ["", "calm", "playful", "affectionate", "independent", "social", "energetic"];

export default function BreedsPage() {
  const { token, isLoggedIn } = useAuth();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [temperament, setTemperament] = useState("");
  const [hypoallergenic, setHypoallergenic] = useState("");

  const fetchBreeds = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (temperament) params.set("temperament", temperament);
      if (hypoallergenic) params.set("hypoallergenic", hypoallergenic);

      const res = await apiFetch(`/breeds/?${params}`, {}, token);

      if (!res.ok) {
        console.error("API ERROR:", res.status);
        setBreeds([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setBreeds(data);
      } else if (data?.results) {
        setBreeds(data.results);
      } else {
        console.warn("Unexpected API response:", data);
        setBreeds([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setBreeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, [temperament, hypoallergenic, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBreeds();
  };

  const toggleFav = async (id: number) => {
    if (!isLoggedIn) return;

    const res = await apiFetch(`/users/favorite/${id}/`, { method: "POST" }, token);

    if (res.ok) {
      const d = await res.json();
      setBreeds(prev =>
        prev.map(b => (b.id === id ? { ...b, favorited: d.favorited } : b))
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTemperament("");
    setHypoallergenic("");
    setTimeout(fetchBreeds, 0);
  };

  return (
    <div style={{ background: "var(--cream)", minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ background: "var(--espresso)", padding: "3rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "white", marginBottom: "0.5rem" }}>
            Breed Encyclopedia
          </h1>

          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>
            Discover {breeds.length} cat breeds from around the world
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "0.75rem", maxWidth: 600, flexWrap: "wrap" }}
          >
            <input
              className="input-field"
              style={{
                flex: 1,
                minWidth: 200,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
              placeholder="Search breeds…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--mocha)",
              opacity: 0.6,
            }}
          >
            Filter:
          </span>

          <select
            value={temperament}
            onChange={e => setTemperament(e.target.value)}
            className="input-field"
            style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
          >
            {TEMPERAMENTS.map(t => (
              <option key={t} value={t}>
                {t || "All Temperaments"}
              </option>
            ))}
          </select>

          <select
            value={hypoallergenic}
            onChange={e => setHypoallergenic(e.target.value)}
            className="input-field"
            style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
          >
            <option value="">All</option>
            <option value="true">Hypoallergenic</option>
            <option value="false">Not Hypoallergenic</option>
          </select>

          {(temperament || hypoallergenic || search) && (
            <button
              onClick={clearFilters}
              className="btn-secondary"
              style={{
                background: "rgba(120, 120, 120, 0.12)",
                color: "var(--mocha)",
                border: "1px solid rgba(120, 120, 120, 0.25)",
                padding: "0.4rem 0.9rem",
                fontSize: "0.85rem",
                borderRadius: 2,
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--mocha)", opacity: 0.5 }}>
            Loading breeds…
          </div>
        ) : breeds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <p style={{ color: "var(--mocha)", opacity: 0.6 }}>
              No breeds found. Try different filters.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {breeds.map(b => (
              <div key={b.id} className="card" style={{ position: "relative" }}>
                <div
                  style={{
                    height: 180,
                    background: "var(--cream-dark)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {b.image ? (
                    <img
                      src={`http://127.0.0.1:8000${b.image}`}
                      alt={b.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "4rem",
                      }}
                    >
                      🐱
                    </div>
                  )}

                  {isLoggedIn && (
                    <button
                      onClick={() => toggleFav(b.id)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        borderRadius: 2,
                        width: 34,
                        height: 34,
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {b.favorited ? "❤️" : "🤍"}
                    </button>
                  )}
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "var(--espresso)",
                      }}
                    >
                      {b.name}
                    </h3>

                    {b.hypoallergenic && (
                      <span className="badge badge-sage" style={{ marginLeft: 6 }}>
                        Hypo
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--mocha)",
                      opacity: 0.6,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {b.origin && `📍 ${b.origin}`}
                    {b.origin && b.lifespan && " · "}
                    {b.lifespan && `⏳ ${b.lifespan}`}
                  </div>

                  {b.temperament && (
                    <span
                      className="badge badge-amber"
                      style={{ marginBottom: "1rem", display: "inline-block" }}
                    >
                      {b.temperament}
                    </span>
                  )}

                  <Link
                    href={`/breeds/${b.id}`}
                    style={{
                      display: "block",
                      marginTop: "0.75rem",
                      color: "var(--terracotta)",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}