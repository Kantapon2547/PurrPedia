"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  // Temporary login state (replace later with real auth)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">

      {/* Logo */}
      <div className="text-xl font-bold text-orange-500">
        🐱 PurrPedia
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {isLoggedIn ? (
          <>
            {/* Show after login */}
            <Link href="/dashboard" className="hover:text-orange-500">
              Home
            </Link>

            <Link href="/breeds" className="hover:text-orange-500">
              Cat Breeds
            </Link>

            <Link href="/submit" className="hover:text-orange-500">
              Submit Info
            </Link>

            <Link href="/admin" className="hover:text-orange-500">
              Admin
            </Link>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="border px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Landing Page Buttons */}
            <Link
              href="/login"
              className="px-5 py-2 rounded-full border border-gray-400 text-sm hover:bg-gray-200 transition"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 border rounded-full text-sm hover:text-orange-500 "
            >
              Sign Up
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}