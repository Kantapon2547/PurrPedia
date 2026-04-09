import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "PurrPedia — Cat Breed Knowledge Platform",
  description: "Explore cat breeds, care tips, and join a community of feline enthusiasts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}