"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token"); // ensure JWT cleared
    router.push("/");
  };

  return (
    <nav
      style={{
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >

        {/* LOGO */}
        <Link
          href="/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: "1.6rem" }}>🐱</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--espresso)",
            }}
          >
            Purr<span style={{ color: "var(--terracotta)" }}>Pedia</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <Link href="/dashboard" style={linkStyle}>Home</Link>
          <Link href="/breeds" style={linkStyle}>Breeds</Link>

          {isLoggedIn && (
            <>
              <Link href="/submit" style={linkStyle}>Submit</Link>
              <Link href="/profile" style={linkStyle}>Profile</Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              style={{ ...linkStyle, color: "var(--terracotta)", fontWeight: 600 }}
            >
              Admin
            </Link>
          )}
        </div>

        {/* AUTH SECTION */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {isLoggedIn ? (
            <>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--mocha)",
                  fontWeight: 500,
                }}
              >
                {user?.username}
                {isAdmin && (
                  <span
                    style={{
                      marginLeft: 6,
                      color: "var(--terracotta)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Admin
                  </span>
                )}
              </span>

              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: "0.4rem 1rem", fontSize: "0.78rem" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost" style={btnStyle}>
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary" style={btnStyle}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* styles */
const linkStyle = {
  color: "var(--mocha)",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const btnStyle = {
  padding: "0.4rem 1rem",
  fontSize: "0.78rem",
};